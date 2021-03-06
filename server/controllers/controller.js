var mongoose = require('mongoose');
var genericController = {};
var User = mongoose.model('User');
var Todo = mongoose.model('Todo');
var Goal = mongoose.model('Goal');
var Plan = mongoose.model('Plan');

genericController.register = function(req,res){
  console.log('sc', req.body);
	User.findOne({email: req.body.email}, function(err, results){
    console.log('sc', results);
		if(results){
			res.json({status: 1, message: "Email already taken"});
		}
		else{
      		var user = new User(req.body);
			user.save(function(err){
				if(err){
					console.log(err);
				}
				else{
					res.json({user: user, status: 0});
				}
			})
		}
	});
}
genericController.login = function(req,res){
  // console.log('sc:login', req.body);
	User.findOne({email: req.body.email}, function(err, results){
		if(results){
			if(results.password==req.body.password){
				res.json({status: 1, results: results});
			}else{
				res.json({status: 0, message: "Passwords do not match"});
			}
		}
		else{
			res.json({status: 0, message: "Email does not exist"});
		}
	})
}
genericController.addPlan = function(req, res) {
    console.log(req.body.user_id);
    User.findOne({_id: req.body.user_id}, function(err, user) {
        var plan = new Plan({_user: req.body.user_id, title: req.body.title,
         description: req.body.description, todo: req.body.plans, share: false});
        plan._user = user._id;
        user.plans.push(plan);
        plan.save(function(err) {
            user.save(function(err, results) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("DATA: ", results)
                    res.json(results);
                }
            })
        })

    })
}

genericController.getuserbyemail = function(req, res){
	console.log(req.params.id);
	User.findOne({email: req.params.id}).populate('plans')
	.exec(function(err, user){
		if(err){
			console.log(err);
		} else {
			console.log("SERVER BY EMAIL", user);
			res.json(user);
		}
	})
}
genericController.getOneUser = function(req,res){
	User.findOne({_id: req.params.id}).populate('plans')
        .exec(function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        })

}
genericController.getAllTodos = function(req, res) {
    Todo.find({}, function(err, results) {
        if (err) {
            console.log(err);
        } else {
        	console.log("ALL TODOS", results);
            res.json(results);
        }
    })
}
genericController.getAllGoals = function(req, res) {
    Goal.find({}).populate('todos')
        .exec(function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        })
}
genericController.getOnePlan = function(req,res){
    Plan.findOne({_id: req.params.id}).populate('todo')
        .exec(function(err, data) {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        })
}
genericController.seeTodoInfo = function(req,res){
    Todo.find({_id: req.params.id}, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            res.json(results);
        }
    })
}
genericController.removePlan = function(req, res){



	console.log(req.body._id);
	Plan.findOne({_id: req.body._id}, function(err, plan){
		console.log(plan);
		for(x of plan.todo){
			console.log("IN FOR LOOP", x);
			Todo.update({_id: x._id}, {$inc: {count: -1}}, function(err, todo){

			})
		}
	})
	Plan.remove({_id: req.body._id}, function(err, p){
		User.update({_id: req.body.user}, {$pull: {plans : req.body._id}}, function(err, user){
			console.log("REMOVE PLAN", user);
		})
	})
	res.end();
}

genericController.editplan = function(req, res){
    console.log("EDIT PLAN", req.body);
    Plan.findOne({_id: req.body._id}, function(err, plan){
        plan.title = req.body.title;
        plan.description = req.body.description;
        plan.todo = req.body.plans;
        plan.save(function(err,plan){
            if(err){
                console.log(err);
            } else {
                res.end();
            }
        })
    })
}

genericController.updateTodos = function(req, res){
	console.log("UPDATE TODOS", req.body);
	for(x in req.body){
		console.log(req.body[x]);

		Todo.update({_id: req.body[x]}, {$inc: {count: 1}}, function(err, todo){
			if(err){
				console.log(err);
			} else {
			}
		})
	}
	res.end();

}

genericController.sharePlan = function(req, res){
	console.log(req.body);
	Plan.update({_id: req.body._id}, {share: req.body.checked}, function(err, plan){
	})
	res.end();
}

genericController.getplans = function(req, res){
	Plan.find({share: true}).populate('_user')
	.exec(function(err, plans){
		if(err){
			console.log(err);
		} else {
			res.json(plans);
		}
	})
}

module.exports = genericController;
