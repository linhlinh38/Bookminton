import { PackageCourtTypeEnum } from '../utils/enums';

const mongoose = require('mongoose');
const packageCourtSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(PackageCourtTypeEnum)
  },
  totalPrice: {
    type: Number
  },
  priceEachCourt: {
    type: Number
  },
  maxCourt: {
    type: Number
  },
  duration: {
    type: Number
  },
  description: {
    type: String
  }
});

const packageCourtModel = mongoose.model('PackageCourt', packageCourtSchema);
export default packageCourtModel;
