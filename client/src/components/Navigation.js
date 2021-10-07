import {Navbar, Form, Container} from 'react-bootstrap';
import {CheckAll} from 'react-bootstrap-icons';
import {LogoutButton, LoginButton} from './Login';


const Navigation = (props) => {
    const {onLogOut, loggedIn, admin, onLogIn, showQuestions} = props;

    return (
        <Navbar className="w-100" bg="danger" variant="dark" fixed="top">
            <Container>
                {loggedIn ?
                    (<Navbar.Brand href="/admin">
                        <CheckAll className="mr-1" size="30"/> SurveyAdmin
                    </Navbar.Brand>) : (<Navbar.Brand href="/">
                        <CheckAll className="mr-1" size="30"/> SurveyApp
                    </Navbar.Brand>)}

                <div className="nav-item navbar-nav">
                    <Navbar.Text className="mx-2">
                        {admin && admin.username && `Welcome, ${admin?.username}!`}
                    </Navbar.Text>
                    <Form inline className="mx-2">
                        {loggedIn ?
                            <LogoutButton className="text-right" logout={onLogOut}/> : (showQuestions === false ? (
                                <LoginButton className="mx-auto" login={onLogIn}/>) : (<></>))
                        }
                    </Form>
                </div>
            </Container>
        </Navbar>
    )
}

export default Navigation;