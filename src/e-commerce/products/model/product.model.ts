/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { IProduct } from '../interface/products.interface';

export type ProductDocument = HydratedDocument<IProduct>;

@Schema({timestamps: true,toJSON: {getters: true,},})
export class Product extends Document implements IProduct {
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  subTitle: string;
  @Prop({ type: Number, required: true })
  price: number;
  @Prop({ type: Array, required: true })
  size: [number];
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: String, required: true })
  slug: string;
  @Prop({ type: String, required: true })
  category: string;
  @Prop({ type: Array, required: true })
  images: [string];
}
export const ProductSchema = SchemaFactory.createForClass(Product);
