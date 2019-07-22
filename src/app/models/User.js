import Sequelize, { Model } from 'sequelize';
import bcry from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password = await bcry.hash(user.password, 8);
      }
    });

    return this;
  }

  checkPassword(password) {
    return bcry.compare(password, this.password);
  }
}

export default User;
