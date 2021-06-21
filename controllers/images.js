const Image = require('../models/Image');
const path = require('path');
const queryCreator = require('../commonHelpers/queryCreator');
const _ = require('lodash');

exports.addImage = (req, res, next) => {
  try {
    let { name, affiliation } = req.body;

    const { img } = req.files;
    let fileName = name + '.jpg';
    let pathName = path.resolve(__dirname, '..', 'static', 'img', affiliation, fileName);

    img.mv(pathName);

    Image.findOne({ name: name + '.jpg' }).then(image => {
      if (image) {
        return res.status(400).json({ message: `Картинка с названием "${image.name}" уже существует` });
      } else {
        const initialQuery = _.cloneDeep({ ...req.body, imageUrl: pathName });
        const newImage = new Image(queryCreator(initialQuery));

        newImage
          .save()
          .then(image => res.json(image))
          .catch(err =>
            res.status(400).json({
              message: `Произошла ошибка на сервере: "${err}" `,
            })
          );
      }
    });
  } catch (err) {
    res.status(400).json({
      message: `Произошла ошибка на сервере: "${err}" `,
    });
  }
};

// exports.updateBrand = (req, res, next) => {
//   Brand.findOne({ _id: req.params.id })
//     .then(brand => {
//       if (!brand) {
//         return res.status(400).json({ message: `Бренд с id "${req.params.id}" не найден.` });
//       } else {
//         const initialQuery = _.cloneDeep(req.body);
//         const updatedBrand = queryCreator(initialQuery);

//         Brand.findOneAndUpdate({ _id: req.params.id }, { $set: updatedBrand }, { new: true })
//           .then(brand => res.json(brand))
//           .catch(err =>
//             res.status(400).json({
//               message: `Произошла ошибка на сервере: "${err}" `,
//             })
//           );
//       }
//     })
//     .catch(err =>
//       res.status(400).json({
//         message: `Произошла ошибка на сервере: "${err}" `,
//       })
//     );
// };

// exports.deleteBrand = (req, res, next) => {
//   Brand.findOne({ _id: req.params.id }).then(async brand => {
//     if (!brand) {
//       return res.status(400).json({ message: `Бренд с id "${req.params.id}" не найден.` });
//     } else {
//       const brandToDelete = await Brand.findOne({ _id: req.params.id });

//       Brand.deleteOne({ _id: req.params.id })
//         .then(deletedCount =>
//           res.status(200).json({
//             message: `Бренд с названием "${brandToDelete.name}" успешно удален из БД `,
//           })
//         )
//         .catch(err =>
//           res.status(400).json({
//             message: `Произошла ошибка на сервере: "${err}" `,
//           })
//         );
//     }
//   });
// };

// exports.getBrands = (req, res, next) => {
//   Brand.find()
//     .then(brands => res.json(brands))
//     .catch(err =>
//       res.status(400).json({
//         message: `Произошла ошибка на сервере: "${err}" `,
//       })
//     );
// };
