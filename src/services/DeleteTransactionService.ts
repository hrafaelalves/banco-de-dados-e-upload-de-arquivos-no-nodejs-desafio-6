import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {

    const transactionRepository = getRepository(Transaction);

    const checkTransactionExist = await transactionRepository.findOne({
      where: { id }
    });

    if(!checkTransactionExist){
      throw new AppError('This id is not exist', 401);
    }

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
