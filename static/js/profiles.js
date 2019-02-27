"use strict";

function profileWallets () {
  const profileWalletsEl = document.getElementById("profile-wallets");
  Object.keys(sessionStorage).forEach(function(key){
    const li = document.createElement('li');

      if (sessionStorage.getItem(key) != '') {
        li.textContent = sessionStorage.getItem(key);
        profileWalletsEl.appendChild(li);
        profileWalletsEl.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-success" data-cmd="keep" id="'+ key +'">Keep</button><button type="button" class="btn btn-danger" data-cmd="delete" id="'+ key +'">Delete</button>');
      } else {
        li.textContent = key;
        profileWalletsEl.appendChild(li);
        profileWalletsEl.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-success" data-cmd="keep" id="'+ key +'">Keep</button><button type="button" class="btn btn-danger" data-cmd="delete" id="'+ key +'">Delete</button>');
      }
    });
  }
function runSavedWallets() {
  $('#wallet_run').on('click', (evt) => {
      $.get('/profile_wallets.json', (response) => {
            const results = response;
            console.log(results);
      });
    })
  }

runSavedWallets();
profileWallets();