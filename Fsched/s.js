$(document).ready(() => {
  // Add schedule
  $('#scheduleForm').submit((event) => {
    event.preventDefault();

    const courseId = $('#courseId').val();
    const day = $('#day').val();
    const startTime = $('#startTime').val();
    const endTime = $('#endTime').val();
    const slot = $('#slot').val();

    const scheduleItem = `<li>Course ID: ${courseId}, Day: ${day}, Start Time: ${startTime}, End Time: ${endTime}, Slot: ${slot}</li>`;
    $('#scheduleList').append(scheduleItem);

    // Update the database
    $.post('/timeslots', { courseId, day, startTime, endTime, slot }, (data) => {
      console.log(data.message);
    });

    // Reset form
    $('#courseId').val('');
    $('#day').val('');
    $('#startTime').val('');
    $('#endTime').val('');
    $('#slot').val('');
    $('#scheduleForm')[0].reset();
  });
});
