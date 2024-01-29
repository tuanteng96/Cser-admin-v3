import React from "react";
import { Provider } from "react-redux";
import BonusSales from "../features/BonusSales";

function App({ store }) {

  return (
    <Provider store={store}>
      <BonusSales />
    </Provider>
  );
}

export default App;
