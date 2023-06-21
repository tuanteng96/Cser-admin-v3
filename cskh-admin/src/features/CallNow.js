import React from "react";
import axios from "axios";

function CallNow(props) {
  const CallNow = () => {
    // axios
    //   .post("https://crm.pavietnam.vn/api/callNow.php", {
    //     api_key: "8c46c5a86da489049c412444402bb821",
    //     extension: "102",
    //     phone: "0971021196",
    //   })
    //   .then(function(response) {
    //     console.log(response);
    //   })
    //   .catch(function(error) {
    //     console.log(error);
    //   });

    axios
      .post("http://localhost:5000/call", {
        api_key: "8c46c5a86da489049c412444402bb821",
        extension: "102",
        phone: "0971021196",
      })
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });
  };
  return (
    <div>
      <button tyle="button" className="btn btn-success" onClick={CallNow}>
        Call
      </button>
    </div>
  );
}

export default CallNow;
