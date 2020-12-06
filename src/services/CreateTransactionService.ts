import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request{
  title: string;
  value: number;
  type: "income" | "outcome";
  category: string;
}

class CreateTransactionService {
  private transactionRepository: TransactionsRepository;

  constructor(transactionRepository: TransactionsRepository){
    this.transactionRepository = transactionRepository;
  }

  public async execute({ title, value, type, category }: Request): Promise<Transaction> {

    const categoryRepository = getRepository(Category);

    const validTypes = ["income", "outcome"];

    if(!validTypes.includes(type)){
      throw new AppError('This type is not valid', 401);
    }

    const { total } = await this.transactionRepository.getBalance();

    if(type === "outcome" && value > total){
      throw new AppError("You don't have enough balance", 400);
    }

    let checkCategoryExist = await categoryRepository.findOne({
      where: { title: category }
    });

    if(!checkCategoryExist){
      checkCategoryExist = categoryRepository.create({
        title: category
      });

      await categoryRepository.save(checkCategoryExist);
    }

    const transaction = this.transactionRepository.create({
      title,
      value,
      type,
      category_id: checkCategoryExist.id
    })

    await this.transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
