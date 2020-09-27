var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value, 
		this.percentage = -1;	
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if(totalIncome > 0) {
			this.percentage = Math.round((this.value/ totalIncome) * 100);	
		} else {
			this.percentage = -1;
		}
		
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};


	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum =0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.totals[type] =sum;
	};

	var data ={
		allItems: {
			exp: [],
			inc: []
		},
		totals : {
			exp: 0,
			inc: 0
		},
		budget :0,
		percentage: -1
	};

	return {
		addItem : function(type,des,val) {
			var newItem, ID;

			//create new id
			if(data.allItems[type].length  > 0) {
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
			} else {
				ID =0;
			}
			

			//create new item based on inc or exp type
			if (type == 'exp') {
				newItem = new Expense(ID ,des ,val);
			} else if (type == 'inc') {
				newItem = new Income(ID ,des ,val);
			}
			//push it into our data structure
			data.allItems[type].push(newItem);
			//return newItem
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids ,index;
			ids = data.allItems[type].map(function(current) {
				return current.id
			});

			index = ids.indexOf(id);

			if(index !== -1) {
				data.allItems[type].splice(index, 1);
			}

		},

		calculateBudget: function() {
			//calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//calculate budget: income -expenses
			data.budget = data.totals.inc - data.totals.exp;
			//calculate the percentage of expenses
			if(data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}
			else {
				data.percentage = -1;
			}
			

		},

		calculatePercentages : function() {
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});


		},

		getPercentages : function(){
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},


		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function(){
			console.log(data);
		}
	};

}) ();


var UIController = (function () {

	var DomStrings = {
		inputType : '.add_type',
		inputDescription : '.add_description',
		inputValue : '.add_value',
		inputBtn: '.add_btn',
		incomeContainer: '.income_list',
		expensesContainer: '.expenses_list',
		budgetLabel: '.budget_value',
		incomeLabel: '.budget_income-value',
		expensesLabel: '.budget_expenses-value',
		percentageLabel: '.budget_expenses-percentage',
		container: '.container',
		expensespercLabel : '.item_percentage',
		dateLabel : '.budget_title-month'
	};

	var formatNumber = function(num, type) {
		var numSplit, int ,dec, type;

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];
		if(int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3);
		}
		dec = numSplit[1];
		 
		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec
	};

	var nodeListForEach = function(list, callback) {
		for(var i = 0; i < list.length; i++) {
			callback(list[i],i)
		}
	};

	return {
		getInput : function() {
			return {
				type : document.querySelector(DomStrings.inputType).value,
				description : document.querySelector(DomStrings.inputDescription).value,	
				value : parseFloat(document.querySelector(DomStrings.inputValue).value) 
			};
		},

		addListItem: function(obj,type) {
			var html, newhtml, element;
			
			//create html string with some placeholder	
			if (type === 'inc') {
				element = DomStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_delete"><button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

			} else if(type === 'exp') {	
				element = DomStrings.expensesContainer;					
				html ='<div class="item clearfix" id="exp-%id%"><div class="item_description">%description%</div><div class="right clearfix"><div class="item_value">%value%</div><div class="item_percentage">21%</div><div class="item_delete"><button class="item_delete-btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			
			//replace the placeholder text with the actual data 
			newhtml = html.replace('%id%',obj.id);
			newhtml = newhtml.replace('%description%',obj.description);
			newhtml = newhtml.replace('%value%',formatNumber(obj.value, type));
			
			//insert the html into dom
			document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);

		},

		deleteListItem : function(SelectorID) {
			var el =document.getElementById(SelectorID);
			el.parentNode.removeChild(el);
			
		},

		clearFields : function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DomStrings.inputDescription + ',' + DomStrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array){
				current.value = "";

			});

			fieldsArr[0].focus();
			
		},

		displayBudget : function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
			}
			else {
				document.querySelector(DomStrings.percentageLabel).textContent = '--'
			}
		},

		displayPercentages : function(percentages) {
			var fields = document.querySelectorAll(DomStrings.expensespercLabel);


			nodeListForEach(fields, function(current , index) {
				if(percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---'
				}
			});

		},

		displayMonth: function() {
			var now, year,month, months;
			
			now = new Date();
			months = ['Jan','Feb','Mar','April','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
			month =now.getMonth();
			year = now.getFullYear();
			document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changedType: function() {
			var fields = document.querySelectorAll(
				DomStrings.inputType, + ',' +
				DomStrings.inputDescription + ',' +
				DomStrings.inputValue);
			
			nodeListForEach(fields,function(cur) {
				cur.classList.toggle('red-focus');
			});
			
			document.querySelector(DomStrings.inputBtn).classList.toggle('red');
		},	


		getDomStrings : function() {
			return DomStrings;
		}
	};
	///
}) ();

var controller = (function(budgetCtrl,UICtrl) {

	var setupEventlisteners = function() {

		var DOM = UICtrl.getDomStrings();

		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

		document.addEventListener('keypress',function(event) {
			if(event.keyCode === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
	};

	var updateBudget = function(){
		//1.calculate the budget
		budgetCtrl.calculateBudget();
		//2.return the budget
		var budget =budgetCtrl.getBudget();
		//3.display the budget on UI
		UICtrl.displayBudget(budget);

	} 

	var updatePercentages = function() {
		//calculate the percentages
		budgetCtrl.calculatePercentages();
		//read them from the budget controller
		var  percentages =budgetCtrl.getPercentages();
		//update UI with the new percentages
		UICtrl.displayPercentages(percentages); 
	}

	var ctrlAddItem = function() {
		var input,newItem;
		//1.get the ionput data
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
		//2.add item to budget controller 
			newItem =budgetCtrl.addItem(input.type,input.description,input.value);
		
		//3,add item to the UI
			UICtrl.addListItem(newItem,input.type);   
		
		//4.clear the fields
			UICtrl.clearFields();

		//5.calculate and update budget
			updateBudget();

		//6.calculateand update percentages
			updatePercentages();

		}

	};

	var ctrlDeleteItem =function(event) {
		var itemID,type,ID;

		itemID = event.target.parentNode.parentNode.parentNode .parentNode.id;

		if (itemID) {
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			//delete the item from data structure
			budgetCtrl.deleteItem(type, ID);

			//delete item from UI
			UICtrl.deleteListItem(itemID);

			//update nad show the new budget
			updateBudget();

			//calculate and update percentagfes
			updatePercentages();
		}

	};
	return {
		init: function() {
			console.log('app started');
			UICtrl.displayMonth(); 
			UICtrl.displayBudget({
				budget:0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventlisteners();
		}
	};

})(budgetController,UIController);

controller.init();

