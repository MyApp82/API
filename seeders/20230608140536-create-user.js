'use strict';
const bcryptjs = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {  async up (queryInterface, Sequelize) {
  /**
   * Add seed commands here.
   *
   * Example:
  */
  const user = await queryInterface.rawSelect('Users', {
    where: {
      name: 'user1',
    },
  }, ['id']);

  if(user == null) {
    await queryInterface.bulkInsert('Users', [{
      name: 'user1',
      email: 'user1@gmail.com',
      password: await bcryptjs.hash('user1', 12),
      status: true
    }], {});
  }
},

async down (queryInterface, Sequelize) {
  /**
   * Add commands to revert seed here.
   *
   * Example:
  */
  await queryInterface.bulkDelete('Users', null, {});
}
};
