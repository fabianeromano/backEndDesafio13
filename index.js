import express from "express";
import { engine } from "express-handlebars";
import http from "http";
import { Server as IOServer } from "socket.io";
import { faker } from '@faker-js/faker';
import normalizr from 'normalizr';
import util from "util";
import cookieParser from 'cookie-parser'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import passportLocal from 'passport-local'
const LocalStrategy = passportLocal.Strategy
import dotenv from 'dotenv';
dotenv.config();
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const schema = normalizr.schema;
const normalize = normalizr.normalize;

import { comparePassword, getHashedPassword } from "./src/utils/password.js"
import { connectMongoDb } from "./src/utils/mongodb.js";
import { messageRepository } from "./src/db/messages.js";
import { productosRepository } from "./src/db/productos.js";
import UsersDaoMongoDb from "./src/db/users.js";
const usersDao = new UsersDaoMongoDb();

const app = express();
const httpServer = http.createServer(app);
const io = new IOServer(httpServer);

app.engine("handlebars", engine());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "handlebars");
app.use(cookieParser());

passport.use('login', new LocalStrategy(
  (username, password, done) => {
    usersDao.getFiltered({
      email: username
    }).then(user => {
      if (!user) {
        console.log('User Not Found with username ' + username);
        return done(null, false);
      }

      if (!comparePassword(password, user.password)) {
        console.log('Invalid Password');
        return done(null, false);
      }

      return done(null, user);
    }).catch((err) => {
      return done(err);
    });
  }
))

passport.use('signup', new LocalStrategy({
  passReqToCallback: true
},
  (req, username, password, done) => {
    usersDao.getFiltered({
      username
    }).then(user => {
      if (user) {
        console.log('User already exists');
        return done(null, false)
      }

      const newUser = {
        username: username,
        password: getHashedPassword(password),
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      }

      usersDao.save(newUser)
        .then(userWithId => {
          console.log(user)
          console.log('User Registration succesful');
          return done(null, userWithId);
        })
        .catch(err => {
          if (err) {
            console.log('Error in Saving user: ' + err);
            return done(err);
          }
        });
    }).catch(err => {
      if (err) {
        console.log('Error in SignUp: ' + err);
        return done(err);
      }
    });
  })
)

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await usersDao.getById(id);
  done(null, user);
});

app.use(session({
  secret: 'asdasd',
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 60000
  },
  rolling: true,
  resave: true,
  saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());

app.set("views", "./src/views");

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.render("home", { username: req.user?.email ?? '' });
  } else {
    return res.render('login');
  }
});
app.get("/login", (req, res) => {
  return res.render("login");
});
app.post("/login", passport.authenticate('login', { failureRedirect: 'faillogin' }), (req, res) => {
  return res.redirect('/');
});
app.get("/register", (req, res) => {
  return res.render("register");
});
app.post("/register", passport.authenticate('signup', { failureRedirect: 'failsignup' }), async (req, res) => {
  return res.redirect('/');
});
app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { 
      return next(err); 
      }
    res.redirect('/');
  });
});

app.get("/message-center", (req, res) => {
  return res.render("message-center");
});
app.get("/productos-test", (req, res) => {
  let productos = []
  for (let i = 0; i < 5; i++) {
    const producto = {
      title: faker.commerce.productName(),
      price: faker.commerce.price(),
      thumbnail: faker.image.imageUrl(640, 480, 'commerce', true),
    }
    productos.push(producto)
  }
  res.render("productos-test", { productos, tieneProductos: productos.length > 0 });
});

app.get("/productos", async (req, res) => {
  try {
    const productos = await productosRepository.getAll();
    res.render("productos", { productos, tieneProductos: productos.length > 0 });
  } catch (err) {
    res.send.status(404);
  }
});
app.get("/messages", (req, res) => {
  try {
    const parsedMessages = messageRepository.getAll();
    const authorSchema = new schema.Entity("author", {}, { idAttribute: "email" });
    const message = new schema.Entity('messages', {
      author: authorSchema,
    });
    const messageSchema = { messages: [message] };
    const data = { messages: parsedMessages }
    const normalizedMessages = normalize(data, messageSchema);

    const normalSize = Buffer.from(JSON.stringify(util.inspect(parsedMessages), true, 12, true)).length
    const newSize = Buffer.from(JSON.stringify(util.inspect(normalizedMessages), true, 12, true)).length

    res.send({
      messages: normalizedMessages,
      compression: newSize / normalSize,
    });
  } catch (err) {
    res.send.status(404);
  }
});

const PORT = process.env.PORT || 8080;

const initServer = async () => {
  const server = httpServer.listen(PORT, async () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`);
  });

  io.on("connection", async (socket) => {
    console.log("Usuario conectado");

    const productos = await productosRepository.getAll();
    socket.emit("productos", productos);

    const messages = await messageRepository.getAll();
    socket.emit("messages", messages);

    socket.on("new-product", async (data) => {
      await productosRepository.save(data);
      const productos = await messageRepository.getAll();
      io.sockets.emit("productos", productos);
    });

    socket.on("new-message", async (data) => {
      await messageRepository.save(data);
      const messages = await messageRepository.getAll();
      io.sockets.emit("messages", messages);
    });
  });
};

const bootstrap = async () => {
  messageRepository.initFile();
  await connectMongoDb();
  await productosRepository.createTable();

  await initServer();
}

bootstrap();