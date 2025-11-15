<form class="login-form">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <h1>Welcome to Bloxion</h1>
  <input class="lf--submit" type="submit" value="Log In with Roblox">
</form>
$left-color:  #242e4d;
$right-color: #897e79;
$green-dark:  #35c3c1;
$green-light: #00d6b7;
$gray-light:  #f5f6f8;

html, body {
  height: 100%;
  margin: 0;
}

body {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba($left-color, .95), rgba($right-color, .95));
  font-family:
    -apple-system, BlinkMacSystemFont, /* SF Pro on iOS/macOS */
    "Inter",                          /* Inter for most other devices */
    "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
    "Helvetica Neue", sans-serif;
  color: #fff;

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url(data:image/png;base64,...); // keep your noise texture
    opacity: .25;
  }
}

.login-form {
  position: relative;
  padding: 2em;
  width: 90%;
  max-width: 320px;
  text-align: center;

  /* Glass effect */
  background: rgba(255, 255, 255, 0.08); /* faint white overlay */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  border: 1px solid rgba(255, 255, 255, 0.18); /* subtle border */
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);

  h1 {
    margin: 0 0 1.5em;
    font-size: 1.25em;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.5px;
  }
}

  h1 {
    margin: 0 0 1.5em;
    font-size: 1.25em;
    font-weight: 600;
    letter-spacing: 0.5px;
  }


.lf--submit {
  display: block;
  width: 100%;
  padding: 1em;
  border: none;
  border-radius: 6px;
  background: linear-gradient(to right, $green-dark, $green-light);
  color: #fff;
  font-size: .9em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  cursor: pointer;
  transition: all .2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba($green-dark, .4);
  }
  &:focus {
    outline: none;
    transform: scale(1.03);
  }
}