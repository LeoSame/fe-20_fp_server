const line = `<div style="background-color:#454545;height:2px;margin-bottom:20px;"></div>`;

const header = (firstName, lastName) => {
  const logo = `
    <a href="https://smart-electronix.herokuapp.com/" target="_blank" style="padding-bottom:10px;">
    <img src="https://smart-electronix.herokuapp.com/static/media/logo.ca897391.png" width="200" height="60" alt="logo" style="will-change: transform;">
    </a>`;

  const greeting = `<div style="font-size:18px;padding-bottom:15px;font-family:Arial, sans-serif;">
    Здравствуйте, ${firstName} ${lastName}!</div>`;

  const mobile = `<div>
    <a style="color:#000;text-decoration:none;margin-bottom:20px;" href="tel:+380440000000">
    044 000-00-00 </a><br/>
    <a style="color:#000;text-decoration:none;" href="tel:+380950000000">
    095 000-00-00 </a>
    </div>`;

  const header = `<div style="color:#000;display:flex;justify-content:space-between;align-items:center;">
  <div>${logo}${greeting}</div>
  ${mobile}
  </div>
  ${line}`;

  return header;
};

module.exports = function messageForgotPassword(customer, token) {
  const headers = header(customer.firstName, customer.lastName);
  const message = `<div style="font-size:18px;padding-bottom:15px;line-height:1.5;font-family:Arial, sans-serif;">
  <a href="https://smart-electronix.herokuapp.com/reset/${token}" target="_blank" rel="noreferrer noopener">Восстановить пароль </a>
  от вашего профиля на сайте smart-electronix.herokuapp.com. Если вы не запрашивали восстановление пароля, проигнорируйте это письмо
  </div>`;
  return `${headers}${message}`;
};
