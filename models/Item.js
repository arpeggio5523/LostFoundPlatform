import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  item_name: {
    type: String,
    required: [true, 'Item name mandatory'],
    trim: true,
    maxlength: [100, 'Item name max 100 characters']
  },
  item_description: {
    type: String,
    required: [true, 'Item description required'],
    maxlength: [500, 'Description has max length 500 characters']
  },
  item_status: {
    type: String,
    required: true,
    enum: {
      values: ['Lost', 'Found', 'Returned'],
      message: 'given value must be one of [Lost, Found, Returned]'
    },
    default: 'Lost'
  },
  item_id: {
    type: String,
    unique: true,
    sparse: true
  }
}
);

const Item = mongoose.model('Item', itemSchema);

export default Item;