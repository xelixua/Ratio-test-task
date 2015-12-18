/*global angular*/
(function () {
    var app = angular.module('tasksList', []);
    
    app.controller('taskCreator', ["$rootScope", function (rootScope) {
        var date = new Date(),
            self = this,
            DEFAULT_TASK_NAME = "Имя задачи",
            DEFAULT_TASK_DESCRIPTION = "Описание задачи",
            CURRENT_DATE  = (date.getDate() < 10? "0" + date.getDate() : date.getDate()) + "/" + (date.getMonth() + 1 < 10? "0" + date.getMonth() + 1 : date.getMonth() + 1) + "/" + date.getFullYear(),
            CURRENT_END_TIME;
            date.setMinutes(date.getMinutes() + 10);
            CURRENT_END_TIME = (date.getHours() < 10? "0" + date.getHours() : date.getHours()) + ":" + (date.getMinutes() < 10? "0" + date.getMinutes() : date.getMinutes());
            
            rootScope.taskCreator = this;
            this.TASK_NAME = DEFAULT_TASK_NAME;
            this.TASK_DESCRIPTION = DEFAULT_TASK_DESCRIPTION;
            this.END_DATE = CURRENT_DATE;
            this.END_TIME = CURRENT_END_TIME;
            
            rootScope.createTask = function () {
                var dateTemplate = new RegExp('^0[1-9]|[12][0-9]|3[01]/0[1-9]|1[012]/20\d\d$',''),
                    timeTemplate = new RegExp('^(((([0-1][0-9])|(2[0-3])):?[0-5][0-9])|(24:?00))$',''),
                    newTask = {},
                    dateArr,
                    timeArr,
                    taskEndDate;
                    
                    if(self.TASK_NAME.length == 0) {
                        alert("Задача должна иметь имя");
                        return;
                    }
                    
                    if(self.TASK_NAME.length > 20) {
                        alert("Длина имени задачи не может быть более 20 символов");
                        return;
                    }
                    
                    if(!dateTemplate.test(self.END_DATE)) {
				        alert("Дата должна иметь формат ДД/ММ/ГГГГ");
				        return;
			        }
			        
			       if(!timeTemplate.test(self.END_TIME)) {
				        alert("Время должно иметь формат ЧЧ:ММ");
				        return;
			        }
			        
			        newTask.name = self.TASK_NAME;
			        newTask.description = self.TASK_DESCRIPTION;
                    dateArr = self.END_DATE.split("/");
                    timeArr = self.END_TIME.split(":");
                    taskEndDate = new Date();
                    taskEndDate.setHours(timeArr[0]);
                    taskEndDate.setMinutes(timeArr[1]);
                    taskEndDate.setSeconds(0);
                    taskEndDate.setDate(dateArr[0]);
                    taskEndDate.setMonth(dateArr[1]-1);
                    taskEndDate.setFullYear(dateArr[2]);
			        newTask.endDate = taskEndDate;
			        
			        if(taskEndDate.getTime() - new Date().getTime() < 0) {
			            alert("Время окончания задачи должно быть в будущем");
			            return;
			        }
			        
			        rootScope.$broadcast('newTask',  {task: newTask});
			        self.TASK_NAME = DEFAULT_TASK_NAME;
                    self.TASK_DESCRIPTION = DEFAULT_TASK_DESCRIPTION;
                    self.END_DATE = CURRENT_DATE;
                    self.END_TIME = CURRENT_END_TIME;
            };
    }]);
    
    app.controller("tasksList", ["$rootScope", function (rootScope) {
        var tasks = [];
        
        rootScope.tasksList = this;
        this.tasks = tasks;
        rootScope.$on("newTask", function (event, args) {
            var newTask = args.task;
            tasks.push(newTask);
        });

        //update time left for tasks
        setInterval(function () {
                var currentDate = new Date(),
                    timeLeft,
                    i = 0;
                    
                for(; i < tasks.length; i++) {
                    timeLeft = tasks[i].endDate.getTime() - currentDate.getTime();
                    if(timeLeft < 0) {
                        if(timeLeft < -5000) {
                            tasks.splice(i, 1);
                        }
                        continue;
                    }
                    tasks[i].timeLeft = "Осталось " + (timeLeft/31104000000 > 1 ? (timeLeft - timeLeft%31104000000)/31104000000 + " лет " : " ")
                                                    + (timeLeft/2592000000 > 1? (timeLeft%31104000000 -  timeLeft%2592000000)/2592000000 + " месяцев " : " " )
                                                    + (timeLeft/86400000 > 1? (timeLeft%2592000000 - timeLeft%86400000)/86400000 + " дней " : " ")
                                                    + (timeLeft/3600000 > 1? (timeLeft%86400000 - timeLeft%3600000)/3600000 + " часов " : " ")
                                                    + (timeLeft/60000 > 1? (timeLeft%3600000 - timeLeft%60000)/60000 + " минут " : " ")
                                                    + (timeLeft%60000 - timeLeft%1000)/1000 + " секунд ";
                                                   
                }
                rootScope.$apply();
            }, 1000);
    }]);
})();