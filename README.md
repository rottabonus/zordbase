# zordbase

**The software is under construction!**

This is a [WordBase](https://apkpure.com/wordbase-%E2%80%93-fun-word-search-battles-with-friends/com.wordbaseapp)-like game, called ZordBase.

WordBase was a fun android-game, which I played a lot myself.<br>
Sadly, it was closed for unprofitability.<br>
I have developed the project to amuse myself.

For now, you can play against a computer in Finnish.

The [Finnish wordlist](http://kaino.kotus.fi/sanat/nykysuomi/) is from the [Institute for the languages of Finland](https://www.kotus.fi/en)

First demo-version hosted in [Heroku](http://ancient-sierra-67919.herokuapp.com/)

If you want to run the software in your own device:

clone repo
```
$ git clone https://github.com/rottabonus/zordbase
```

start backend (which serves front as a static file) 
```
$ cd zordbase
$ cd back
$ npm install
$ npm run dev
```

Then you can access the game in localhost:3000

### frontend-development
start backend and run frontend with
```
$ cd zordbase
$ cd front
$ npm install
$ npm start
```

