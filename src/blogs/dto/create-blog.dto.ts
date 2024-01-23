/* eslint-disable prettier/prettier */
interface IAuthor {
    name: "Abir Santra",
    img: "user.png",
    designation: string;
}
export class CreateBlogDto {
    title: string;
    subtitle: string;
    category: string;
    img: string;
    description: string;
    published: string;
    author: IAuthor;

}
