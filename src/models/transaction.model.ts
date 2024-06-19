import { PaymentMethodEnum, TransactionTypeEnum } from '../utils/enums';

const mongoose = require('mongoose');
const transactionSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      require: true
    },
    type: {
      type: String,
      require: true,
      enum: Object.values(TransactionTypeEnum)
    },
    paymentMethod: {
      type: String,
      require: true,
      enum: Object.values(PaymentMethodEnum)
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  },
  {
    timestamps: true
  }
);

const transactionModel = mongoose.model('Transaction', transactionSchema);
export default transactionModel;
