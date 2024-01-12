import os
from jsmin import jsmin
from fastapi import FastAPI, Request, Response
from fastapi.responses import FileResponse
from middleware import decode_token
from routes.organisation import organisation_route
from routes.user import user_route
from routes.form import form_route
from routes.question_group import question_group_route
from routes.question import question_route
from routes.option import option_route
from routes.cascade import cascade_route
from routes.skip_logic import skip_logic_route
from routes.member_type import member_type_route
from routes.isco_type import isco_type_route
from routes.data import data_route
from routes.download import download_route
from routes.download_summary import download_summary_route
from routes.collaborator import collaborator_route
from routes.feedback import feedback_route
from routes.roadmap import roadmap_route
from routes.prefilled import prefilled_route
from routes.test import test_route
from templates.main import template_route


app = FastAPI(
    root_path="/api",
    title="ISCO",
    version="1.0.0",
    contact={
        "name": "Akvo",
        "url": "https://akvo.org",
        "email": "dev@akvo.org",
    },
    license_info={
        "name": "AGPL3",
        "url": "https://www.gnu.org/licenses/agpl-3.0.en.html",
    },
)

# use bucket folder as env cluster
# bucket folder will be sed by cluster name when deploy
BUCKET_FOLDER = os.environ["BUCKET_FOLDER"]
CONFIG_SOURCE_PATH = f"./source/config/{BUCKET_FOLDER}"
JS_FILE = "./config.min.js"

app.include_router(organisation_route)
app.include_router(user_route)
app.include_router(member_type_route)
app.include_router(isco_type_route)
app.include_router(form_route)
app.include_router(question_group_route)
app.include_router(question_route)
app.include_router(option_route)
app.include_router(cascade_route)
app.include_router(skip_logic_route)
app.include_router(data_route)
app.include_router(download_route)
app.include_router(download_summary_route)
app.include_router(collaborator_route)
app.include_router(feedback_route)
app.include_router(template_route)
app.include_router(roadmap_route)
app.include_router(prefilled_route)
# add test route except for production
if BUCKET_FOLDER != "production":
    app.include_router(test_route)


@app.get("/", tags=["Dev"])
def read_main():
    return "OK"


@app.get("/health-check", tags=["Dev"])
def health_check():
    return "OK"


@app.get(
    "/config.js",
    response_class=FileResponse,
    tags=["Config"],
    name="config.js",
    description="static javascript config",
)
async def main(res: Response):
    # we can separate computed_validations config by BUCKET_FOLDER
    computed_validation = f"{CONFIG_SOURCE_PATH}/computed_validations.json"
    # if not os.path.exists(JS_FILE):
    env_js = "var __ENV__={"
    env_js += 'client_id:"{}"'.format(os.environ["CLIENT_ID"])
    env_js += ', client_secret:"{}"'.format(os.environ["CLIENT_SECRET"])
    env_js += "};"
    min_js = jsmin(
        "".join(
            [
                env_js,
                "var computed_validations=",
                open(computed_validation).read(),
                ";",
            ]
        )
    )
    open(JS_FILE, "w").write(min_js)
    res.headers["Content-Type"] = "application/x-javascript; charset=utf-8"
    return JS_FILE


@app.middleware("http")
async def route_middleware(request: Request, call_next):
    auth = request.headers.get("Authorization")
    if auth:
        auth = decode_token(auth.replace("Bearer ", ""))
        request.state.authenticated = auth
    response = await call_next(request)
    return response
