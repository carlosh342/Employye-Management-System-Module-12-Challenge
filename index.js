const sql=require("mysql2")
const inquirer =require("inquirer");
const express = require("express")


const PORT = process.env.PORT || 3306;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = sql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'employeemanager_db'
  },
  console.log(`Connected to the employeemanager database.`)
);
db.connect(function(err){
  if(err) throw err;
  else{Prompt()}
});

function Prompt(){

  inquirer
   .prompt({
     type:"list",
     name:"task",
     message:"What would you like to do? ",
     choices:[
      "View Employees",
      "View Employees by Department",
      "Add employee",
      "Remove Employee",
      "Update Employee Role",
      "Add Role",
      "End"
     ]
     
   })
    .then(function({task}){
     switch(task){
      case "View Employees":
       view_employee();
        break;
      case "View Employees by Department":
        view_Department();
        break;
      case "Add Employee":
        add_employee();
        break;
      case "Remove Employee":
       remove_employee();
       break;
      case "Update Employee Role":
        update_employeerole();
        break;
      case "Add Role":
       add_role();
       break;
      case "End":
        db.end();
        break;
     }
   })
}
function view_employee(){
  console.log("Viewing employees\n");
  const query =
  `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager
  FROM employee e
  LEFT JOIN role r 
    ON e.role_id = r.id
  LEFT JOIN department d 
    ON d.id = r.department_id
  LEFT JOIN employee m 
    ON  e.manager_id = m.id`

  db.query(query, function(err,res){
    if(err) throw err;
    console.table(res);
    console.log("Employees viewed\n");
    Prompt();
  })
}

function view_Department(){
  console.log("Viewing employees by department\n");
  const query=
  `SELECT d.id, d.name, r.salary as budget
  FROM employee e 
  LEFT JOIN role r ON e.role_id = r.id
  LEFT JOIN department d ON d.id = r.department_id
  GROUP BY d.id, d.name`
  
  db.query(query, function(err,res){
   if(err) throw err;
   const department_choises=res.map(data =>({
    value:data.id, name:data.name
   }))
   console.table(res);
   console.log("Department view suceed\n");
   prompt_department(department_choises);
  })}

  function prompt_department(department_choises){

    inquirer
    .prompt([
      {type:"list",
      name:"department ID",
      message:"Which department you choose",
      choices:department_choises}
    ])
    .then(function(answer){
      console.log("answer",answer.deparmentID)
      var query=`
      SELECT e.id,e.first_name, e.last_name, r.title, d.name AS department
      FROM employee e
      JOIN role r ON e.role_id = r.id
      JOIN department d ON d.id = r.department_id
      WHERE d.id = ?`
    db.query(query,answer.deparmentID,function(err,res){
      if(err) throw err;
      console.table("response",res);
      console.log(res.affectedRows +"Employees are viewed\n")
      Prompt();
    })
    })
  }

  function add_employee(){
    console.log("Insert an employee");

    var query=
    `SELECT r.id, r.title, r.salary
    FROM role r`
    db.query(query,function(err,res){
      if(err) throw err;
      const role_choise = res.map(({id,title,salary}) =>({
        value:id, title:`${title}`,salary:`${salary}`
      }))
      console.table(res);
      console.log("Roles to Insert/n");
      prompt_Insert(role_choise);
    })
  }

  function prompt_Insert(role_choise){
    inquirer
    .prompt([
      {
        type:"input",
        name:"first_name",
        message:"Whats the employee's first name?",
      },
      {
        type:"input",
        name:"last_name",
        message:"Whats the employee's last name?",
      },
      {
        type:"input",
        name:"roleID",
        message:"Whats the employee's role?",
        choices: role_choise
      },
    ])
    .then(function(answer){
      console.log(answer);

      var query =`INSERT INTO employee SET ?`
      db.query(query,
        {
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: answer.roleID,
          manager_id: answer.managerID,
        },
        function (err,res){
         if(err) throw err;
         console.table(res);
         console.log(res.insertedRows +"Inserted sucessfully\n")
         Prompt();
        })
    })
  }

  function remove_employee(){
    console.log("Deleting an employee");

    var query = "SELECT e.id, e.first_name, e.last_name FROM employee e"
    db.query(query, function(err,res){
      if (err) throw err;
    const delete_employeechoise = res.map(({id, first_name,last_name})=>({
      value: id, name: `${id} ${first_name} ${last_name}`
    }))
     console.table(res);
     console.log("Array to delte\n")
     prompt_delete(delete_employeechoise)
    })
  }
  function prompt_delete(delete_employeechoise){
    inquirer
     .prompt([
      {
        type:"list",
        name:"employee_ID",
        message:"Which employee would you like to remove?",
        choices:delete_employeechoise
      }
     ])
     .then(function(answer){
      var query=`DELETE FROM employee WHERE ?`;
      db.query(query,{id:answer.employee_ID}, function(err,res){
        if(err) throw err;

        console.table(res);
        console.log(res.affectedRows+"Rmployee deleted\n")
        Prompt();
      })
     })
  }
  function update_employeerole(){
    console.log("Update employee role");
    var query=`SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name,"",m.last_name) AS manager 
    FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON d.id = r.department_id
    JOIN employee m ON m.id = e.manager_id`
    db.query(query,function(err,res){
      if(err) throw err;
      const employee_choises = res.map(({id, first_name,last_name})=>({
        value:id, name: `${first_name} ${last_name}`
      }))
      console.table(res);
      console.log(" Employee Array to Update\n");
      role_Array();
    })
  }
  function role_Array(employee_choises){
    console.log("Update employee role");
    var query=
    `SELECT r.id, r.title, r.salary FROM role r`
    db.query(query, function(err,res){
      if(err) throw err;
      const role_choises=res.map(({id, title, salary})=>({
        value:id, title:`${title}`, salary:`${salary}`
      }))
      console.table(res);
      console.log(" Role Array to update\n");
      prompt_employeerole(employee_choises,role_choises)
    })
  }
  function prompt_employeerole(employee_choises,role_choises){

    inquirer
     .prompt([
      {
        type:"list",
        name:"employeeID",
        message:"Whats the name of the employee you want to change its role called?",
        choices:employeeChoices
      },
      {
        type:"list",
        name:"roleID",
        message:"What role do you want to change?",
        choices:roleChoices
      }
     ])
     .then(function(answer){
      var query = `UPDATE employee SET role_id =? WHERE id=?`
      db.query(query,
       [
        answe.roleID,
        answer.employee_ID
       ],
        function(err,res){
          if(err) throw err;
          
          console.table(res);
          console.log(res.affectedRows+"Updated sucessfully\n");
          Prompt();
        })
     })
  }

  function add_role(){
    var query=
    `SELECT d.id, d.name, r.salary AS budget
    FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON d.id = r.department_id 
    GROUP by d.id, d.name`

    db.query(query, function(err,res){
      if(err) throw err;

      const department_c = res.map(({id, name})=>({
        value:id, name:`${id} ${name}`
      }))
      console.table(res);
      console.log("Department array\n")
      prompt_addrole(department_c)
    })
  }
  function prompt_addrole(department_c){

    inquirer
     .prompt([
      {
        type:"input",
        name:"roleTitle",
        message:"What is the role title?"
      },
      {
        type:"input",
        name:"roleSalary",
        message:"What is the role salary?"
      },
      {
        type:"list",
        name:"departmentID",
        message:"What is the department of the role?",
        choices:department_c
      },
     ])
     .then(function(answer){
      var query = `INSERT INTO role SET ?`
      db.query(query,{
        title: answer.title,
        salary: answer.salary,
        deparmentID: answer.deparmentID
      },
      function(err,res){
        if(err) throw err;
        console.table(res);
        console.log("Role inserted")
        Prompt();
      })
     })
  }