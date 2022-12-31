import './style.css'

export const ProfilePage = () => {

    return (<>
        <h1>Настройки профиля:</h1>

        <div className="profile__image">
            <img src={JSON.parse(localStorage.getItem('user'))?.admin ? "/images/admin.png" : "/images/student.jpg"} alt="empty" />
        </div>
        <h2>{JSON.parse(localStorage.getItem('user'))?.name}</h2>
        <h2 className="profile__margin">{`(${JSON.parse(localStorage.getItem('user'))?.admin ? "Администратор" : "Учащийся"})`}</h2>
        <h2>Описание профиля</h2>
        <div class="settings-change">
            <div class="settings-change__current">
                <p>Текущее:</p>
                <div class="current__username">
                    {JSON.parse(localStorage.getItem('user'))?.desc}
                </div>
            </div>
            <div class="settings-change__new">
                <p>Изменить:</p>
                <form method="post">
                    <input type="text" name="username" class="username-field" required />
                    <input type="submit" value="Изменить" name="uname-change-submit" class="submit-btn" />
                </form>
            </div>
        </div>
        <div class="error-message">
            {/* <?php echo $data[1]; ?> */}
        </div>
    </>
    )
}