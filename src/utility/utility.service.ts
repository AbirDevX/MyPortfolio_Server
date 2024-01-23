/* eslint-disable prettier/prettier */


import { Injectable } from "@nestjs/common";
import { unlink } from "fs";
@Injectable()
export class UtilityService {
    async toDeleteFile(path: string) {
        unlink(path, (err) => {
            if (err) {
                console.log(err, " Error was occure when deleting Image!!");
            }
        });
    }
}
