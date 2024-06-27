exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('retailers').del()
    .then(function () {
      // Inserts seed entries
      return knex('retailers').insert([
        {name: 'BestBuy', totalProducts: 100, complianceRate: 95.50, averageDeviation: 5.25},
        {name: 'Newegg', totalProducts: 80, complianceRate: 90.00, averageDeviation: 8.30},
        {name: 'Amazon', totalProducts: 120, complianceRate: 98.00, averageDeviation: 2.10}
      ]);
    });
};