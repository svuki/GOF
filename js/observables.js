// A function to construct observable objects. Other objects may subscribe to a particular slot
// in an observable object, and when that slot changes they will be notified. The object itself
// can be handles as normal, but it is enriched with the methods

// observable.addObserver(SLOT_NAME, OBJ)
// observable.notify(SLOT_NAME)

// Whenever a slot is set to a new value, any registered observers are notified automatically.
// The notify method is provided in cases where the value in the slot is mutated. In these cases
// the calling method must explicitely call notify(SLOT_NAME) to broadcast the change to the slot's
// observers.

const makeObservable =
    (function () {
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
	
	return function (obj={}) {
	    let observers = Object.create(observable);
	    return new Proxy(obj, observers);
	};})();

