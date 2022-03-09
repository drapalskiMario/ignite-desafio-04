import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO'
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository'
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { ICreateStatementDTO } from './ICreateStatementDTO';
import { OperationType } from "../../entities/Statement"
import { CreateStatementError } from './CreateStatementError';

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUserRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

describe('CreateStamentUseCase', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUserRepository, inMemoryStatementsRepository);
  })

  it('should be able to create a statement with deposit type with valid parameters', async () => {
    const user: ICreateUserDTO = {
      name: "user test",
      email: "user@mail.com",
      password: "1234"
    }
    const userSaved = await inMemoryUserRepository.create(user);
    const statementOperation: ICreateStatementDTO = {
      user_id: userSaved.id as string,
      type: OperationType.DEPOSIT,
      amount: 150.00,
      description: "testing"
    }
    const statementOperationSaved = await createStatementUseCase.execute(statementOperation);

    expect(statementOperationSaved).toHaveProperty("id");
  });

  it('should be able to create a statement with withdraw type with valid parameters and sufficient balance', async () => {
    const user: ICreateUserDTO = {
      name: "user test",
      email: "user@mail.com",
      password: "1234"
    }
    const userSaved = await inMemoryUserRepository.create(user);
    const statementOperationDeposit: ICreateStatementDTO = {
      user_id: userSaved.id as string,
      type: OperationType.DEPOSIT,
      amount: 150.00,
      description: "testing"
    }
    await createStatementUseCase.execute(statementOperationDeposit);

    const statementOperationWithdraw: ICreateStatementDTO = {
      user_id: userSaved.id as string,
      type: OperationType.WITHDRAW,
      amount: 100.00,
      description: "testing"
    }
    const statementOperationSaved = await createStatementUseCase.execute(statementOperationWithdraw);

    expect(statementOperationSaved).toHaveProperty("id");
  });

  it('should not be able to create stament of type withdraw if balance is lower of wihdraw value', async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "user test",
        email: "user@mail.com",
        password: "1234"
      }
      const userSaved = await inMemoryUserRepository.create(user);
      const statementOperation: ICreateStatementDTO = {
        user_id: userSaved.id as string,
        type: OperationType.WITHDRAW,
        amount: 150.00,
        description: "testing"
      }
      await createStatementUseCase.execute(statementOperation);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it('should not be able to create stament if the user doesnt exist', async () => {
    expect(async () => {
      const statementOperation: ICreateStatementDTO = {
        user_id: "invalid_id",
        type: OperationType.WITHDRAW,
        amount: 150.00,
        description: "testing"
      }
      await createStatementUseCase.execute(statementOperation);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
