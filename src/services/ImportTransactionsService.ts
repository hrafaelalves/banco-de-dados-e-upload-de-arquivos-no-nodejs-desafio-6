import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import { getRepository, In } from 'typeorm';

class ImportTransactionsService {
  //Transaction[]
  async execute(csvTransactionFilename: string): Promise<void> {
    const categoryRepository = getRepository(Category);
    const transactionsRepository = getRepository(Transaction);

    const csvTransactionPath = path.join(uploadConfig.directory, csvTransactionFilename);

    const readCSVStream = fs.createReadStream(csvTransactionPath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines = new Array();

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const createTransaction = new Array();

    const listTransactions = lines.map(async (item) => {

      const [title, type, value, category] = item;

      const transaction = {
        title,
        value,
        type,
        category
      }

      createTransaction.push(transactionsRepository.create(transaction));

      return transaction;
    });

    await transactionsRepository.save(createTransaction);

    console.log(listTransactions);
  }
}

export default ImportTransactionsService;
