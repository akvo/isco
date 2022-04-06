from fastapi import FastAPI, Request
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


@app.get("/", tags=["Dev"])
def read_main():
    return "OK"


@app.get("/health-check", tags=["Dev"])
def health_check():
    return "OK"


@app.middleware("http")
async def route_middleware(request: Request, call_next):
    auth = request.headers.get('Authorization')
    if auth:
        auth = decode_token(auth.replace("Bearer ", ""))
        request.state.authenticated = auth
    response = await call_next(request)
    return response
