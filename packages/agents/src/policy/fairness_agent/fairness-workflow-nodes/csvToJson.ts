import fs from 'fs' ;
import csv from 'csv-parser' ;

import { FairnessState } from '../types';

export async function csvToJson (
    state : FairnessState
) : Promise<Partial<FairnessState>> {

    const results : Record <string , unknown>[] = [] ;
    await new Promise<void>( ( resolve, reject) => {
        fs.createReadStream(state.csv_path)
        .pipe(csv())
        .on("data", data  => results.push(data))
        .on("end", () => resolve())
        .on("error", reject);
    }) ;

   return {
    json_data: results.length > 100 ? results.slice(0, 100) : results,
  };  
}