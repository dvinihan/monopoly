if (document.getElementById('team-submit-button')) {
  document.getElementById('team-submit-button').onclick = () => {
    let teamName = document.getElementById('team-name-input').value;

    window.location.href = '/teamSubmit?teamName=' + teamName;
  };
}

if (document.getElementById('team-save')) {
  document.getElementById('team-save').onclick = () => {
    let teamName = document.getElementById('team-name-input').value;
    let id = document.getElementById('team-id').innerHTML.trim();

    window.location.href = '/teamEditAction?id=' + id + '&teamName=' + teamName;
  };
}

if (document.getElementById('add-room')) {
  document.getElementById('add-room').onclick = () => {
    let name = document.getElementById('new-room-name').value;
    let time = document.getElementById('new-room-record').value;
    let teamId = document.getElementById('new-room-record-team').value;

    window.location.href = `/roomAddAction?name=${name}&time=${time}&teamId=${teamId}`;
  };
}

if (document.getElementById('room-save')) {
  document.getElementById('room-save').onclick = () => {
    let name = document.getElementById('edit-room-name').value;
    let time = document.getElementById('edit-room-time').value;
    let teamName = document.getElementById('edit-room-team').value;
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


