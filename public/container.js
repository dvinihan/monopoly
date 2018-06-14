if (document.getElementById('team-submit-button')) {
  document.getElementById("team-submit-button").onclick = () => {
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
    let roomName = document.getElementById("new-room-name").value;

    let record = document.getElementById("new-room-record").value;

    let recordHolder = document.getElementById("new-room-record-team").value;

    window.location.href = `/roomInsert?roomName=${roomName}&time=${record}&name=${recordHolder}`;
  };
}

//////////////////    WORKING
if (document.getElementById('room-save')) {
  document.getElementById('room-save').onclick = () => {
    let roomName = document.getElementById('edit-room-name').value;
    let time = document.getElementById('edit-room-time').value;
    let teamName = document.getElementById('edit-room-team').value;
    let id = document.getElementById('room-id').innerHTML.trim();

    window.location.href = '/roomUpdate?id=' + id + '&roomName=' + roomName + '&time=' + time + '&teamName=' + teamName;
  };
}

