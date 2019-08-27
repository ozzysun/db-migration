module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.addColumn('Person', 'petName', {
                    type: Sequelize.STRING
                }, { transaction: t }),
                queryInterface.addColumn('Person', 'favoriteColor', {
                    type: Sequelize.STRING,
                }, { transaction: t })
            ])
        })
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.removeColumn('Person', 'petName', { transaction: t }),
                queryInterface.removeColumn('Person', 'favoriteColor', { transaction: t })
            ])
        })
    }
};