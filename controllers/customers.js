const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const keys = require('../config/keys');
const sendMail = require('../commonHelpers/mailSender');
const getConfigs = require('../config/getConfigs');
const { messageForgotPassword } = require('../commonHelpers/generateMessageHtml');
const passport = require('passport');
const uniqueRandom = require('unique-random');
const rand = uniqueRandom(10000000, 99999999);

// Load Customer model
const Customer = require('../models/Customer');

// Load validation helper to validate all received fields
const validateRegistrationForm = require('../validation/validationHelper');

// Load helper for creating correct query to save customer to DB
const queryCreator = require('../commonHelpers/queryCreator');

// Controller for creating customer and saving to DB
exports.createCustomer = (req, res, next) => {
  // Clone query object, because validator module mutates req.body, adding other fields to object
  const initialQuery = _.cloneDeep(req.body);
  initialQuery.customerNo = rand();

  initialQuery.сonfirmRegistrationToken = jwt.sign({ foo: 'bar' }, req.body.email);

  // Check Validation
  const { errors, isValid } = validateRegistrationForm(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Customer.findOne({
    $or: [{ email: req.body.email }, { login: req.body.login }],
  })
    .then(customer => {
      if (customer) {
        if (customer.email === req.body.email) {
          return res.status(400).json({ message: `Email ${customer.email} уже существует` });
        }

        if (customer.login === req.body.login) {
          return res.status(400).json({ message: `Логин ${customer.login} уже существует` });
        }
      }

      // Create query object for qustomer for saving him to DB
      const newCustomer = new Customer(queryCreator(initialQuery));

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newCustomer.password, salt, (err, hash) => {
          if (err) {
            res.status(400).json({ message: `Ошибка на сервере: ${err}` });

            return;
          }

          newCustomer.password = hash;
          newCustomer
            .save()
            .then(async customer => {
              const letterSubject = `Подтверждение регистрации на сайте smart-electronix.herokuapp.com`;
              const letterHtml = messageСonfirmRegistration(customer);

              const mailResult = await sendMail(req.body.email, letterSubject, letterHtml, res);

              const message =
                'Вы успешно зарегистрированы. Вам отпралено письмо на почту для подтверждения регистрации';

              res.json({ message, mailResult });
            })
            .catch(err =>
              res.status(400).json({
                message: `Ошибка на сервере: "${err}" `,
              })
            );
        });
      });
    })
    .catch(err =>
      res.status(400).json({
        message: `Ошибка на сервере: "${err}" `,
      })
    );
};

// Controller for confirm registration customer
exports.forgotRegistration = (req, res, next) => {
  Customer.findOne({ сonfirmRegistrationToken: req.params.token }).then(async customer => {
    if (!customer) {
      return res.status(400).json({
        message: `Пользователя не найдено`,
      });
    } else {
      Customer.findOneAndUpdate(
        { сonfirmRegistrationToken: req.params.token },
        {
          $set: {
            enabled: true,
          },
        },
        { new: true }
      )
        .then(customer => {
          res.json({
            message: 'Регистрация успешно подтверждена',
          });
        })
        .catch(err =>
          res.status(400).json({
            message: `Ошибка на сервере: "${err}" `,
          })
        );
    }
  });
};

// Controller for customer login
exports.loginCustomer = async (req, res, next) => {
  const { errors, isValid } = validateRegistrationForm(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const loginOrEmail = req.body.loginOrEmail;
  const password = req.body.password;
  const configs = await getConfigs();

  // Find customer by email
  Customer.findOne({
    $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
  })
    .then(customer => {
      // Check for customer
      if (!customer) {
        errors.loginOrEmail = 'Пользователя не найдено';
        return res.status(404).json(errors);
      }

      // Check Password
      bcrypt.compare(password, customer.password).then(isMatch => {
        if (isMatch) {
          // Customer Matched
          const payload = {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            isAdmin: customer.isAdmin,
          }; // Create JWT Payload

          if (!customer.enabled) {
            errors.сonfirmRegistration = 'Вы не подтвердили регистрацию. Проверьте свою почту.';
            return res.json(errors);
          }

          // Sign Token
          jwt.sign(payload, keys.secretOrKey, { expiresIn: 36000 }, (err, token) => {
            res.json({
              success: true,
              token: token,
              customer: customer,
            });
          });
        } else {
          errors.password = 'Неверный пароль';
          return res.status(400).json(errors);
        }
      });
    })
    .catch(err =>
      res.status(400).json({
        message: `Ошибка на сервере: "${err}" `,
      })
    );
};

// Controller for getting current customer
exports.getCustomer = (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(400).json({
      message: `Ошибка на сервере: "${err}" `,
    });
  }
};

// Controller for editing customer personal info
exports.editCustomerInfo = (req, res) => {
  // Clone query object, because validator module mutates req.body, adding other fields to object
  const initialQuery = _.cloneDeep(req.body);

  // Check Validation
  const { errors, isValid } = validateRegistrationForm(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  Customer.findOne({ _id: req.user.id })
    .then(customer => {
      if (!customer) {
        errors.id = 'Пользователя не найдено';
        return res.status(404).json(errors);
      }

      const currentEmail = customer.email;
      const currentLogin = customer.login;
      let newEmail;
      let newLogin;

      if (req.body.email) {
        newEmail = req.body.email;

        if (currentEmail !== newEmail) {
          Customer.findOne({ email: newEmail }).then(customer => {
            if (customer) {
              errors.email = `Email ${newEmail} уже существует`;
              res.status(400).json(errors);
              return;
            }
          });
        }
      }

      if (req.body.login) {
        newLogin = req.body.login;

        if (currentLogin !== newLogin) {
          Customer.findOne({ login: newLogin }).then(customer => {
            if (customer) {
              errors.login = `Логин ${newLogin} уже существует`;
              res.status(400).json(errors);
              return;
            }
          });
        }
      }

      // Create query object for qustomer for saving him to DB
      const updatedCustomer = queryCreator(initialQuery);

      Customer.findOneAndUpdate({ _id: req.user.id }, { $set: updatedCustomer }, { new: true })
        .then(customer => res.json(customer))
        .catch(err =>
          res.status(400).json({
            message: `Ошибка на сервере: "${err}" `,
          })
        );
    })
    .catch(err =>
      res.status(400).json({
        message: `Ошибка на сервере:"${err}" `,
      })
    );
};

// Controller for editing customer password
exports.updatePassword = (req, res) => {
  // Check Validation
  const { errors, isValid } = validateRegistrationForm(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  // find our user by ID
  Customer.findOne({ _id: req.user.id }, (err, customer) => {
    let oldPassword = req.body.password;

    customer.comparePassword(oldPassword, function (err, isMatch) {
      if (!isMatch) {
        errors.password = 'Пароль не подходит';
        res.status(400).json(errors);
      } else {
        let newPassword = req.body.newPassword;

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err) throw err;
            newPassword = hash;
            Customer.findOneAndUpdate(
              { _id: req.user.id },
              {
                $set: {
                  password: newPassword,
                },
              },
              { new: true }
            )
              .then(customer => {
                res.json({
                  message: 'Пароль успешно изменен',
                  customer: customer,
                });
              })
              .catch(err =>
                res.status(400).json({
                  message: `Ошибка на сервере: "${err}" `,
                })
              );
          });
        });
      }
    });
  });
};

exports.forgotPassword = (req, res, next) => {
  Customer.findOne({ email: req.body.email }).then(async customer => {
    if (!customer) {
      return res.status(400).json({ message: `Пользователя таким email не найдено` });
    } else {
      const { errors, isValid } = validateRegistrationForm(req.body);

      // Check Validation
      if (!isValid) {
        return res.status(400).json(errors);
      }

      const token = jwt.sign({ foo: 'bar' }, req.body.email);

      Customer.findOneAndUpdate(
        { email: req.body.email },
        { resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 }
      )
        .populate('customerId')
        .then(async customer => {
          const letterSubject = `Восстановления пароля на сайте smart-electronix.herokuapp.com`;
          const letterHtml = messageForgotPassword(customer, token);

          const mailResult = await sendMail(req.body.email, letterSubject, letterHtml, res);

          res.json({ customer, mailResult });
        })
        .catch(err =>
          res.status(400).json({
            message: `Произошла ошибка на сервере: "${err}" `,
          })
        );
    }
  });
};

exports.resetPassword = (req, res, next) => {
  Customer.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }).then(
    async customer => {
      if (!customer) {
        return res.status(400).json({
          message: `Токен сброса пароля недействителен.`,
        });
      } else {
        const { errors, isValid } = validateRegistrationForm(req.body);

        // Check Validation
        if (!isValid) {
          return res.status(400).json(errors);
        }

        let newPassword = req.body.newPassword;

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err) {
              res.status(400).json({ message: `Ошибка на сервере: ${err}` });
              return;
            }
            newPassword = hash;

            Customer.findOneAndUpdate(
              { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },
              {
                $set: {
                  password: newPassword,
                  resetPasswordToken: null,
                  resetPasswordExpires: null,
                },
              },
              { new: true }
            )
              .then(customer => {
                res.json({
                  message: 'Пароль успешно изменен',
                  customer: customer,
                });
              })
              .catch(err =>
                res.status(400).json({
                  message: `Ошибка на сервере: "${err}" `,
                })
              );
          });
        });
      }
    }
  );
};
