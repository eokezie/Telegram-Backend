import mongoose from "mongoose";

type DBInput = {
  db: string | undefined;
};

export default ({ db }: DBInput) => {
  const connect = () => {
    if (db) {
      mongoose
        .connect(db)
        .then(() => {
          console.log("Connected to db successfully 🚀");
        })
        .catch((err: any) => {
          console.log(`Error connecting to database : 😢`, err);

          return process.exit(1);
        });
    } else {
      console.log("Could not read MONGODB URI from env 😢");
    }
  };

  connect();

  mongoose.connection.on("disconnected", connect);
};
