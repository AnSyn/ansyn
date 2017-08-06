## Timer Log Usage

In order to allow using of timer logs in our system you will have to enable it throw definitions in localStorage

Enable log timers 
```javascript
	//open the console window in devTools
	localStorage.setItem('ansyn-logTimerOn0')
```

Disable log timers
```javascript
	//you must remove the item in order to stop logging
	localStorage.removeItem('ansyn-logTimerOn0')
```
