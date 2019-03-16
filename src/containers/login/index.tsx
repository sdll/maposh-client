import { Auth } from "aws-amplify";
import { Formik, FormikActions } from "formik";
import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router-dom";
import * as yup from "yup";
import MaposhAuthenticator from "../../components/authenticator";
import { generateForm, IFormFields, IFormStatus } from "../../components/form";
import {
  FormContainer,
  FormNav,
  FormPrompt,
  FormPromptBox
} from "../../components/form/form.css";
import { NamedModal } from "../../components/modal";
import { MaposhState } from "../../service/store";
import { updateUserStatus } from "../../service/store/system/actions";
import { ISystemState } from "../../service/store/system/types";

interface ILoginFormValues {
  email: string;
  password: string;
}

const initialValues: ILoginFormValues = {
  email: "",
  password: ""
};

interface ILoginProps {
  system: ISystemState;
  updateUserStatus: typeof updateUserStatus;
  override?: string;
  authState?: string;
  onStateChange?: (where: string, state?: object) => void;
  onAuthEvent?: (where: string, event: { type: string; data: string }) => void;
  checkContact?: (user: any) => void;
}

const BaseLogin: React.FC<ILoginProps & RouteComponentProps> = props => {
  const submitForm = (
    values: ILoginFormValues,
    actions: FormikActions<ILoginFormValues>
  ) => {
    Auth.signIn(values.email, values.password)
      .then(user => {
        if (props.onStateChange) {
          props.updateUserStatus({ isAuthenticated: true });
          if (
            user.challengeName === "SMS_MFA" ||
            user.challengeName === "SOFTWARE_TOKEN_MFA"
          ) {
            props.onStateChange("confirmSignIn", user);
          } else if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
            props.onStateChange("requireNewPassword", user);
          } else if (user.challengeName === "MFA_SETUP") {
            props.onStateChange("TOTPSetup", user);
          } else if (props.checkContact) {
            props.checkContact(user);
          }
        }
      })
      .catch(err => {
        if (props.onStateChange) {
          if (err.code === "UserNotConfirmedException") {
            props.onStateChange("confirmSignUp", { email: values.email });
          } else if (err.code === "PasswordResetRequiredException") {
            props.onStateChange("forgotPassword", { email: values.email });
          } else if (props.onAuthEvent) {
            props.onAuthEvent("signIn", { type: "error", data: err.message });
            actions.setSubmitting(false);
          }
        }
      });
  };

  const { t } = useTranslation();

  const formFields: IFormFields[] = t("login.form", {
    returnObjects: true
  });
  const formStatus: IFormStatus = t("login.status", {
    returnObjects: true
  });

  const signupSchema = yup.object().shape({
    email: yup
      .string()
      .email(t("login.errors.emailIsValid"))
      .required(t("login.errors.email")),
    password: yup.string().required(t("login.errors.password"))
  });
  const goSignUp = () => {
    if (props.onStateChange) {
      props.onStateChange("signUp", {});
    }
  };
  const goResetPassword = () => {
    if (props.onStateChange) {
      props.onStateChange("forgotPassword");
    }
  };
  return (
    <div>
      {props.authState === "signIn" && (
        <FormContainer>
          <Formik
            initialValues={initialValues}
            validationSchema={signupSchema}
            onSubmit={submitForm}
            render={generateForm(formFields, formStatus)}
          />
          {props.onStateChange && (
            <FormPrompt>
              <FormPromptBox>
                <Trans i18nKey="signup.prompt">
                  Don't have an account? Sign up
                  <FormNav onClick={() => goSignUp()}>here</FormNav>.
                </Trans>
              </FormPromptBox>
              <FormPromptBox>
                <Trans i18nKey="user.troubleshooting.forgotten_password">
                  Reset your password
                  <FormNav onClick={() => goResetPassword()}>here</FormNav>.
                </Trans>
              </FormPromptBox>
            </FormPrompt>
          )}
        </FormContainer>
      )}
    </div>
  );
};

const mapStateToProps = (state: MaposhState) => ({
  system: state.system
});

export const Login = withRouter(
  connect(
    mapStateToProps,
    { updateUserStatus }
  )(BaseLogin)
);

// const LoginModal = withRouter(NamedModal("login", <Login />));
const LoginModal = withRouter(NamedModal("login", <MaposhAuthenticator />));

export default LoginModal;
