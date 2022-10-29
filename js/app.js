//Dark Mode Enabling - Local Storage

let btnDarkMode = document.getElementById("botonDarkMode");
let btnLightMode = document.getElementById("botonLightMode");

let modoOscuro;
//Condicional revisando si existe algo en Storage
if (localStorage.getItem("darkMode")) {
  modoOscuro = localStorage.getItem("darkMode");
} else {
  console.log("Entro por primera vez");
  localStorage.setItem("darkMode", false);
}

//Condicional que evalúa la variable obtenida en modoOscuro
// En lineas comentadas mantengo la forma directa de modificar el HTML
if (modoOscuro == "true") {
  //document.body.style.backgroundColor = "#181818"
  //document.body.style.color = "#f9f9f9"
  document.body.classList.add("darkMode");
} else {
  //document.body.style.backgroundColor = "#f9f9f9"
  //document.body.style.color = "#181818"
  document.body.classList.remove("darkMode");
}

//Eventos btnDarkMode
// En lineas comentadas mantengo la forma directa de modificar el HTML
btnDarkMode.addEventListener("click", () => {
  console.log("Funciona Boton oscuro");
  //document.body.style.backgroundColor = "#181818"
  //document.body.style.color = "#f9f9f9"
  document.body.classList.add("darkMode");
  localStorage.setItem("darkMode", true);
});
btnLightMode.addEventListener("click", () => {
  console.log("Funciona Boton claro");
  //document.body.style.backgroundColor = "#f9f9f9"
  //document.body.style.color = "#181818"
  document.body.classList.remove("darkMode");
  localStorage.setItem("darkMode", false);
});

//Me traigo lo del DOM a las variables

let enter_budget = document.getElementById("enter_budget");
let budget_amt = document.getElementById("budget_amt");
let enter_exp = document.getElementById("enter_exp");
let exp_name = document.getElementById("exp_name");
let exp_amt = document.getElementById("exp_amt");
let bud = document.getElementById("bud");
let exp = document.getElementById("exp");
let balance = document.getElementById("balance");
let table = document.getElementById("table");
let tbody = document.getElementById("tbody");
let modify_elem = document.getElementById("modify");
let url = location.href.substr(0, location.href.indexOf("#"));

//Guardo y reviso que haya algo en localStorage, si hay lo muestro
const toStorage = (what, { budget, exp_name, exp_amt, old_name }) => {
  if (typeof Storage !== undefined) {
    let user = localStorage.getItem("user");
    if (user === null) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          budget: 0,
          expenses: [],
          modify: new Date().toLocaleString(),
        })
      );
    }
    //Tomo lo que guarde
    user = localStorage.getItem("user");
    user = JSON.parse(user);
    if (what === "updateBudget") {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, budget, modify: new Date().toLocaleString() })
      );
    } else if (what === "addExpense") {
      let isExists = user.expenses.some((obj) => obj.name === exp_name);
      if (isExists) {
        swal(exp_name + " ya existe");
      } else {
        //Lo pusheo a localStorage
        user.expenses.push({ name: exp_name, amt: exp_amt });
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, modify: new Date().toLocaleString() })
        );
      }
    } else if (what === "updateExpense") {
      user.expenses = user.expenses.map((val) => {
        if (val.name === old_name) {
          return { name: exp_name, amt: exp_amt };
        }
        return val;
      });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, modify: new Date().toLocaleString() })
      );
    } else if (what === "load") {
      modify_elem.innerText = "Última modificación " + user.modify;
      bud.innerText = "$ " + user.budget;
      let total_bal = user.budget;
      let exp_amount = 0;
      if (user.expenses.length > 0) {
        table.classList.remove("d-none");
        tbody.innerHTML = "";
        user.expenses.forEach((val) => {
          tbody.insertAdjacentHTML(
            "beforeend",
            `<tr><td>${val.name}</td><td>${val.amt}</td><td>
                    <button class='btn btn-green' type='button' onclick="updateExp('${val.name}','${val.amt}')"><img src="/img/edit.png" alt="editar"></button>
                    <button class='btn btn-red' type='button' onclick="deleteExp('${val.name}')"><img src="/img/borrar.png" alt="borrar"></button>
                    </td></tr>`
          );
          exp_amount += Number(val.amt);
          total_bal -= val.amt;
        });
      } else {
        table.classList.add("d-none");
      }
      exp.innerText = "$ " + exp_amount;
      if (total_bal < 0) {
        balance.classList.add("red");
        balance.classList.remove("green");
      } else if (total_bal > 0) {
        balance.classList.add("green");
        balance.classList.remove("red");
      }
      balance.innerText = "$ " + total_bal;
    } else if (what === "delete") {
      user.expenses = user.expenses.filter((val) => {
        return val.name !== exp_name;
      });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...user, modify: new Date().toLocaleString() })
      );
    } else {
      swal("Ups algo salió mal");
    }
  } else {
    swal("Tu navegador no acepta Local Storage");
  }
};

toStorage("load", {});

const updateExp = (name, amt) => {
  enter_exp.dataset.task = "updateExpense";
  enter_exp.dataset.old = name;
  enter_exp.lastElementChild.innerText = "Actualiza";
  exp_name.value = name;
  exp_amt.value = amt;
  location.assign(url + "#enter_exp");
  toStorage("load", {});
};
const deleteExp = (exp_name) => {
  toStorage("delete", { exp_name });
  toStorage("load", {});
};

enter_budget.addEventListener("submit", (e) => {
  e.preventDefault();
  if (budget_amt.value === "") {
    swal("Hey, no ingresaste un presupuesto!");
  } else {
    toStorage("updateBudget", { budget: Math.abs(budget_amt.value) });
    toStorage("load", {});
  }
  enter_budget.reset();
});
enter_exp.addEventListener("submit", (e) => {
  e.preventDefault();
  let task = enter_exp.dataset.task;
  let old_name = enter_exp.dataset.old;
  if (exp_name.value.trim() === "" || exp_name.value === undefined) {
    swal("Ingresa un nombre para el gasto");
  } else if (exp_amt.value === "") {
    swal("Ingresa el monto del gasto");
  } else {
    toStorage(task, {
      old_name,
      exp_name: exp_name.value.trim(),
      exp_amt: exp_amt.value.trim(),
    });
    toStorage("load", {});
    if (task === "updateExpense") {
      enter_exp.dataset.task = "addExpense";
      enter_exp.dataset.old = "0";
      enter_exp.lastElementChild.innerText = "Agregar GasTo";
      location.assign(url + "#tbody");
    }
    enter_exp.reset();
  }
});

//Agregando selector de frases random con metodo Fetch
let frase = document.getElementById("frase");
let autor = document.getElementById("autor");
let btn = document.getElementById("btn");

//URL de la API con frases, en ingles por ahora.
const dire = "https://api.quotable.io/random";
let getFrase = () => {
  fetch(dire)
    .then((data) => data.json())
    .then((item) => {
      frase.innerText = item.content;
      autor.innerText = item.author;
    });
};
window.addEventListener("load", getFrase);
btn.addEventListener("click", getFrase);
