import bcrypt from "bcrypt";
import { User } from "../model/user.model";
import { db } from "../db";
import DatabaseError from "../model/errors/database.erro.model";

class UserRepository {
  
  async findAllUsers() {
    const query = `
      SELECT uuid, username
      FROM application_user
    `;
    const { rows } = await db.query<User>(query);
    return rows || [];
  }

  async findById(uuid: string) {
    try {
      const query = `
        SELECT uuid, username
        FROM application_user
        WHERE uuid = $1
      `;
      const values = [uuid];
      const { rows } = await db.query<User>(query, values);
      const [user] = rows;
      return user;
    } catch (error) {
      throw new DatabaseError("Erro na consulta por ID", error);
    }
  }

  async findByUsername(username: string) {
    const query = `
      SELECT uuid, username, password
      FROM application_user
      WHERE username = $1
    `;
    const values = [username];
    const { rows } = await db.query<User>(query, values);
    const [user] = rows;
    
    return user || null;
  }

  async create(user: User) {
    // CORREÇÃO: Verifica se a senha existe antes de fazer hash
    if (!user.password) {
      throw new DatabaseError("Senha é obrigatória para criar usuário", null);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);

    const query = `
      INSERT INTO application_user (
        username,
        password
      )
      VALUES ($1, $2)
      RETURNING uuid
    `;

    const values = [user.username, passwordHash];
    
    const { rows } = await db.query<{ uuid: string }>(query, values);
    const [newUser] = rows;

    return newUser.uuid;
  }

  async update(user: User) {
    // CORREÇÃO: Verifica se a senha existe antes de fazer hash
    if (!user.password) {
      throw new DatabaseError("Senha é obrigatória para atualizar usuário", null);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);

    const query = `
      UPDATE application_user 
      SET username = $1, password = $2
      WHERE uuid = $3
    `;

    const values = [user.username, passwordHash, user.uuid];
    await db.query(query, values);
  }

  async remove(uuid: string) {
    const query = `
      DELETE FROM application_user
      WHERE uuid = $1 
    `;
    const values = [uuid];
    await db.query<{ uuid: string }>(query, values);
  }
}

export default new UserRepository();