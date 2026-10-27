import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../config/db";
export class MediaFile extends Model<InferAttributes<MediaFile>, InferCreationAttributes<MediaFile>> {
  declare id: CreationOptional<number>; declare originalName:string; declare mimeType:string; declare sizeBytes:number; declare checksum:string; declare data:Buffer; declare createdBy:number; declare createdAt:CreationOptional<Date>; declare updatedAt:CreationOptional<Date>;
}
MediaFile.init({
  id:{type:DataTypes.INTEGER.UNSIGNED,autoIncrement:true,primaryKey:true}, originalName:{type:DataTypes.STRING(255),allowNull:false,field:"original_name"},
  mimeType:{type:DataTypes.STRING(100),allowNull:false,field:"mime_type"}, sizeBytes:{type:DataTypes.INTEGER.UNSIGNED,allowNull:false,field:"size_bytes"}, checksum:{type:DataTypes.STRING(64),allowNull:false},
  data:{type:DataTypes.BLOB("long"),allowNull:false}, createdBy:{type:DataTypes.INTEGER.UNSIGNED,allowNull:false,field:"created_by"}, createdAt:DataTypes.DATE,updatedAt:DataTypes.DATE,
},{sequelize,tableName:"media_files",timestamps:true,underscored:true});
export default MediaFile;

