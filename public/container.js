if (document.getElementById('team-submit-button')) {
  document.getElementById('team-submit-button').onclick = () => {
    let teamName = document.getElementById('team-name-input').value;

    window.location.href = '/team-submit?teamName=' + teamName;
  };
}

if (document.getElementById('team-save')) {
  document.getElementById('team-save').onclick = () => {
    let teamName = document.getElementById('team-name-input').value;
    let id = document.getElementById('team-id').innerHTML.trim();

    window.location.href = '/teamUpdate?id=' + id + '&teamName=' + teamName;
  };
}

if (document.getElementById('add-room')) {
  document.getElementById('add-room').onclick = () => {
    let roomName = document.getElementById('new-room-name').value;
    let record = document.getElementById('new-room-record').value;
    let recordHolder = document.getElementById('new-room-record-team').value;

    window.location.href = `/roomInsert?roomName=${roomName}&time=${record}&team=${recordHolder}`;
  };
}

if (document.getElementById('room-save')) {
  document.getElementById('room-save').onclick = () => {
    let roomName = document.getElementById('edit-room-name').value;
    let time = document.getElementById('edit-room-time').value;
    let teamName = document.getElementById('edit-room-team').value;
    let id = document.getElementById('room-id').innerHTML.trim();

    window.location.href = '/roomUpdate?id=' + id + '&roomName=' + roomName + '&time=' + time + '&teamName=' + teamName;
  };
}

if (document.getElementById('room-delete-button')) {
  document.getElementById('room-delete-button').onclick = () => {
    let roomID = document.getElementById('select-delete-room').value;

    window.location.href = '/deleteRoomAction?id=' + roomID;
  };
}

if (document.getElementById('team-delete-button')) {
  document.getElementById('team-delete-button').onclick = () => {
    let teamID = document.getElementById('select-delete-team').value;

    window.location.href = '/deleteTeamAction?id=' + teamID;
  };
}


