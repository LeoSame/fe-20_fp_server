const Brand = require('../models/Brand');
const queryCreator = require('../commonHelpers/queryCreator');
const _ = require('lodash');

exports.addBrand = (req, res, next) => {
  Brand.findOne({ name: req.body.name }).then(brand => {
    if (brand) {
      return res.status(400).json({ message: `Brand with name "${brand.name}" already exists` });
    } else {
      const initialQuery = _.cloneDeep(req.body);
      const newBrand = new Brand(queryCreator(initialQuery));

      newBrand
        .save()
        .then(brand => res.json(brand))
        .catch(err =>
          res.status(400).json({
            message: `Error happened on server: "${err}" `,
          })
        );
    }
  });
};

exports.updateBrand = (req, res, next) => {
  Brand.findOne({ _id: req.params.id })
    .then(brand => {
      if (!brand) {
        return res.status(400).json({ message: `Brand with _id "${req.params.id}" is not found.` });
      } else {
        const initialQuery = _.cloneDeep(req.body);
        const updatedBrand = queryCreator(initialQuery);

        Brand.findOneAndUpdate({ _id: req.params.id }, { $set: updatedBrand }, { new: true })
          .then(brand => res.json(brand))
          .catch(err =>
            res.status(400).json({
              message: `Error happened on server: "${err}" `,
            })
          );
      }
    })
    .catch(err =>
      res.status(400).json({
        message: `Error happened on server: "${err}" `,
      })
    );
};

exports.deleteBrand = (req, res, next) => {
  Brand.findOne({ _id: req.params.id }).then(async brand => {
    if (!brand) {
      return res.status(400).json({ message: `Brand with _id "${req.params.id}" is not found.` });
    } else {
      const brandToDelete = await Brand.findOne({ _id: req.params.id });

      Brand.deleteOne({ _id: req.params.id })
        .then(deletedCount =>
          res.status(200).json({
            message: `Brand witn name "${brandToDelete.name}" is successfully deletes from DB `,
          })
        )
        .catch(err =>
          res.status(400).json({
            message: `Error happened on server: "${err}" `,
          })
        );
    }
  });
};

exports.getBrands = (req, res, next) => {
  Brand.find()
    .then(brands => res.json(brands))
    .catch(err =>
      res.status(400).json({
        message: `Error happened on server: "${err}" `,
      })
    );
};
