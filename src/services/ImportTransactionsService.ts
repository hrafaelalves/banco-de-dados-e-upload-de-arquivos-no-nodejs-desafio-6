import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import uploadConfig from '../config/upload';

import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

class ImportTransactionsService {
  async execute(csvTransactionFilename: string): Promise<Transaction[]> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const csvTransactionPath = path.join(uploadConfig.directory, csvTransactionFilename);

    const readCSVStream = fs.createReadStream(csvTransactionPath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const categories: string[] = [];
    let transactions = new Array();

    parseCSV.on('data', line => {
      categories.push(line[3]);
      transactions.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    for(let index = 0; index < categories.length; index++){

      let checkCategoryExist = await categoryRepository.findOne({
        title: categories[index]
      })

      if(!checkCategoryExist){
        checkCategoryExist = categoryRepository.create({
          title: categories[index]
        });

        await categoryRepository.save(checkCategoryExist);
      }

      const { id } = checkCategoryExist;

      transactions[index][3] = id;
    }

    const returnTransactions = new Array();

    for(let i = 0; i < transactions.length; i++){

      const [ title, type, value, category_id ] = transactions[i];

      const transactionCreate = transactionRepository.create({
        title,
        type,
        value,
        category_id
      });

      returnTransactions.push(transactionCreate);

      await transactionRepository.save(transactionCreate);

    }

    return returnTransactions;
  }
}

export default ImportTransactionsService;
