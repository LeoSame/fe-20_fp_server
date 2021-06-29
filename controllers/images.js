const Image = require('../models/Image');
const path = require('path');
const queryCreator = require('../commonHelpers/queryCreator');
const { unlink } = require('fs');
const _ = require('lodash');

exports.addImage = (req, res, next) => {
  let { name, affiliation, size } = req.body;
  const { img } = req.files;

  try {
    Image.findOne({ name: name }).then(image => {
      if (image) {
        return res.status(400).json({ message: `Картинка с названием "${image.name}" уже существует` });
      } else {
        let fileName = name + '_' + size + '.jpg';
        let pathName = `https://fe-20-final-project.herokuapp.com/static/img/${affiliation}/${fileName}`;

        img.mv(path.resolve(__dirname, '..', 'static', 'img', affiliation, fileName));

        const initialQuery = _.cloneDeep({ ...req.body, imageUrl: pathName, name: name + '_' + size });
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

exports.updateImage = (req, res, next) => {
  Image.findOne({ name: req.params.name })
    .then(image => {
      if (!image) {
        return res.status(400).json({ message: `Картинки с названием "${req.params.name}" нет в базе.` });
      } else {
        const initialQuery = _.cloneDeep(req.body);
        const updatedImage = queryCreator(initialQuery);

        Image.findOneAndUpdate({ name: req.params.name }, { $set: updatedImage }, { new: true })
          .then(image => res.json(image))
          .catch(err =>
            res.status(400).json({
              message: `Произошла ошибка на сервере: "${err}" `,
            })
          );
      }
    })
    .catch(err =>
      res.status(400).json({
        message: `Произошла ошибка на сервере: "${err}" `,
      })
    );
};

exports.deleteImage = (req, res, next) => {
  Image.findOne({ name: req.params.name }).then(async image => {
    if (!image) {
      return res.status(400).json({ message: `Картинка с названием "${req.params.name}" не найдена.` });
    } else {
      const imageToDelete = await Image.findOne({ name: req.params.name });

      Image.deleteOne({ name: req.params.name })
        .then(deletedCount => {
          unlink(`static/img/${image.affiliation}/${image.name}.jpg`, function (err) {
            if (err) return console.log(err);
            console.log('file deleted successfully');
          });

          res.status(200).json({
            message: `Картинка с названием "${imageToDelete.name}" успешно удалена из БД `,
          });
        })
        .catch(err =>
          res.status(400).json({
            message: `Произошла ошибка на сервере: "${err}" `,
          })
        );
    }
  });
};

exports.getImage = async (req, res, next) => {
  const perPage = Number(req.query.perPage);
  const startPage = Number(req.query.startPage);
  const sort = req.query.sort;
  try {
    const images = await Image.find({ affiliation: req.query.affiliation })
      .skip(startPage * perPage - perPage)
      .limit(perPage)
      .sort(sort);

    const imagesQuantity = await Image.find({ affiliation: req.query.affiliation });

    res.json({ images, imagesQuantity: imagesQuantity.length });
  } catch (err) {
    res.status(400).json({
      message: `Произошла ошибка на сервере: "${err}" `,
    });
  }
};

exports.getImageAffiliation = async (req, res, next) => {
  try {
    const images = await Image.find({ affiliation: req.query.affiliation });
    res.json({ images });
  } catch (err) {
    res.status(400).json({
      message: `Произошла ошибка на сервере: "${err}" `,
    });
  }
};
