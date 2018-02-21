let observable = {
    notify : function(prop) {
	this[prop].forEach( (o) => o.update(prop) );
    },
    get : function(target, prop, recv) {
	//Intercept any calls to addObserver while passing others
	//to the target object
	if (prop === "addObserver") {
	    return (name, obj) => {
		if (name in this)
		    this[name].push(obj);
		else if (name in target)
		    this[name] = [obj];
		else
		    throw "Error: attempted to observe nonexistent property: " + name;
	    };
	}
	else if(prop === "removeObserver") {
	    return (name, obj) => {
		if(name in this)
		    this[name] = this[name].filter( (e) => e !== obj );
		else
		    throw "Error: attempted to remove observer from nonexistent property: " + name;
	    };
	}
	//In some cases a slot value will be mutated without invoking set,
	//in these cases we allow the code to explicitely notify others of the change
	else if(prop === "notify") {
	    return (name) => {
		this.notify(name);
	    }
	}
		    
	else
	    return target[prop];
    },
    set : function(target, prop, val) {
	if (prop in this) {
	    target[prop] = val;
	    this.notify(prop);
	    return true;
	}

	else {
	    this[prop] = [];
	    target[prop] = val;
	    return true;
	}
    }
};

function makeObservable(obj={}) {
    let observers = Object.create(observable);
    return new Proxy(obj, observers);
};

