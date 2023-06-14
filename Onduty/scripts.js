function valid()
{
  let name = document.getElementById("name").value;
  let subject = document.getElementById("subject").value;
  let phone = document.getElementById("phone").value;
  let email = document.getElementById("email").value;
  let message = document.getElementById("message").value;
  let error_message = document.getElementById("error_message");
  
  error_message.style.padding = "10px";
  error_message.style.borderRadius = "20px";
  
  let text;
  if(name.length < 3)
  {
    text = "Please Enter valid Name";
    error_message.innerHTML = text;
    return false;
  }
  if(subject.length < 10)
  {
    text = "Please Enter Correct Subject";
    error_message.innerHTML = text;
    return false;
  }
  if(isNaN(phone) || phone.length != 10)
  {
    text = "Please Enter valid Phone Number";
    error_message.innerHTML = text;
    return false;
  }
  if(email.indexOf("@") == -1 || email.length < 4)
  {
    text = "Please Enter valid Email";
    error_message.innerHTML = text;
    return false;
  }
  if(message.length <= 50)
  {
    text = "Please Enter More Than 50 Characters";
    error_message.innerHTML = text;
    return false;
  }
  alert("Form Submitted Successfully!");
  return true;
}