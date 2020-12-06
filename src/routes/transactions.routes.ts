import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });

});

transactionsRouter.post('/', async (request, response) => {

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { title, value, type, category } = request.body;

    const createTransation = new CreateTransactionService(transactionsRepository);

    const transation = await createTransation.execute({ title, value, type, category });

    return response.json(transation);

});

transactionsRouter.delete('/:id', async (request, response) => {

    const { id } = request.params;

    const deleteTransaction = new DeleteTransactionService();

    await deleteTransaction.execute(id);

    return response.status(204).json();
});

transactionsRouter.post('/import', upload.single('csv'), async (request, response) => {

  const uploadCsvtransaction = new ImportTransactionsService();

  const transaction = await uploadCsvtransaction.execute(request.file.filename);

  return response.json(transaction);
});

export default transactionsRouter;
