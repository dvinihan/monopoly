if (document.getElementById('team-submit-button')) {
  document.getElementById('team-submit-button').onclick = () => {
    let teamName = document.getElementById('team-name-input').value.trim();

    window.location.href = '/teamSubmit?teamName=' + teamName;
  };
}

if (document.getElementById('team-save')) {
  document.getElementById('team-save').onclick = () => {
    let teamName = document.getElementById('team-name-input').value.trim();
    let id = document.getElementById('team-id').innerHTML.trim();

    window.location.href = '/teamEditAction?id=' + id + '&teamName=' + teamName + '&score=' + parseInt(document.getElementById('score-number').innerHTML);
  };
}

if (document.getElementById('add-room')) {
  document.getElementById('add-room').onclick = () => {
    let name = document.getElementById('new-room-name').value.trim();
    let time = document.getElementById('new-room-record').value.trim();
    let teamId = document.getElementById('new-room-record-team').value;

    window.location.href = `/roomAddAction?name=${name}&time=${time}&teamId=${teamId}`;
  };
}

if (document.getElementById('room-save')) {
  document.getElementById('room-save').onclick = () => {
    let name = document.getElementById('edit-room-name').value.trim();
    let time = document.getElementById('edit-room-time').value.trim();
    let teamName = document.getElementById('edit-room-team').value.trim();
    let id = document.getElementById('room-id').innerHTML.trim();

    window.location.href = '/roomEditAction?id=' + id + '&name=' + name + '&time=' + time + '&teamName=' + teamName;
  };
}

if (document.getElementById('room-delete-button')) {
  document.getElementById('room-delete-button').onclick = () => {
    let roomID = document.getElementById('select-delete-room').value;

    window.location.href = '/roomDeleteAction?id=' + roomID;
  };
}

if (document.getElementById('team-delete-button')) {
  document.getElementById('team-delete-button').onclick = () => {
    let teamID = document.getElementById('select-delete-team').value;

    window.location.href = '/teamDeleteAction?id=' + teamID;
  };
}

if (document.getElementById('login-button')) {
  document.getElementById('login-button').onclick = () => {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    window.location.href = `/verify?username=${username}&password=${password}`;
  };
}

if (document.getElementById('score-dec')) {
  document.getElementById('score-dec').onclick = () => {
    let oldScore = parseInt(document.getElementById('score-number').innerHTML);
    document.getElementById('score-number').innerHTML = oldScore - 1;
  };
}
if (document.getElementById('score-inc')) {
  document.getElementById('score-inc').onclick = () => {
    let oldScore = parseInt(document.getElementById('score-number').innerHTML);
    document.getElementById('score-number').innerHTML = oldScore + 1;
  };
}



