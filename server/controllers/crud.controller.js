import mongoose from 'mongoose';
import slugify from 'slugify';
import ModelExist from '../models/ModelExist.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import createModel from '../utils/createModel.js';

export const create = catchAsync(async (req, res) => {
  //slugify the model name to avoid any space
  const modelName = slugify(req.body.crudName, { lower: true });

  //create the requested crud model
  const Model = createModel(`${modelName}-cruds`);
  const model = new Model({ ...req.body, crudName: modelName });
  await model.save();

  //save record on the model is created
  await ModelExist.create({ exists: true, crudName: model.crudName });

  //create a data model
  createModel(modelName);

  //send response
  res.status(201).json({ data: model });
});

export const get = catchAsync(async (req, res) => {
  //get the corresponding from database
  const { db } = mongoose.connection;
  const data = await db.collection(`${req.params.crudName}-cruds`).findOne();

  //check if data exists or not
  if (!data) throw new AppError(404, 'No data found on this collection');

  //send response
  res.status(200).json(data);
});

//TODO: include show in add menu
export const getAllCrudsItem = catchAsync(async (req, res) => {
  const crudItems = await (
    await ModelExist.find({ exists: true })
  ).map(collection => collection.crudName);

  return res.status(200).json({ crudItems });
});

export const deleteCrudItem = catchAsync(async (req, res) => {
  const { db } = mongoose.connection;

  const found = await db.collection(`${req.params.crudName}-cruds`).findOne();

  if (!found) throw new AppError(400, 'No collection found');

  await db.collection(`${req.params.crudName}-cruds`).drop();
  await db.collection(`${req.params.crudName}`).drop();
  await ModelExist.findOneAndUpdate({ crudName: found.crudName }, { exists: false });

  return res.status(200).json({
    status: 'success',
    message: 'Crud item deleted successfully',
  });
});
