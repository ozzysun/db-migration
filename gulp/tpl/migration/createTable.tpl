module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('<%=table%>', {
    <% for(var i = 0; i < columns.length; i++) { %>
      <%=columns[i].columnName%>: {
        <%for(var prop in columns[i]){%>
          <%if(prop !== 'columnName'){%>
            <%=prop%>: <%=columns[i][prop]%><%if(prop !== 'autoIncrement'){%>,<%}%>
          <%}%>
        <%}%>
      } <%if(i<columns.length-1){%>,<%}%>
    <%}%>
    }) 
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('<%=table%>');
  }
}