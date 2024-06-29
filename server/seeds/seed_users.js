const bcrypt = require("bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex("users").del();

  // Tests User Password Hashing
  const hashedPassword = await bcrypt.hash("team1spectra", 10);

  await knex("users").insert([
    {
      first_name: "Nick",
      last_name: "Doucette",
      email: "nickdoucette24@gmail.com",
      password: hashedPassword,
    },
    {
      first_name: "Ali",
      last_name: "Hayder",
      email: "alihayder@dell.com",
      password: hashedPassword,
    },
    {
      first_name: "Sunshine",
      last_name: "Agoo",
      email: "sunshine.agoo@gmail.com",
      password: hashedPassword,
    },
  ]);
};