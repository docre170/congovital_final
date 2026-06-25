<?php
session_start();

require_once __DIR__ . '/backend/config/database.php';
require_once __DIR__ . '/backend/models/User.php';
require_once __DIR__ . '/backend/models/Appointment.php';

$userId = null;
if (isset($_SESSION['user_id'])) {
    $userId = (int) $_SESSION['user_id'];
} elseif (isset($_GET['user_id'])) {
    $userId = (int) $_GET['user_id'];
}

if (!$userId) {
    header('Location: frontend/html/abonne.html');
    exit;
}

$userModel = new User();
$user = $userModel->findById($userId);

if (!$user) {
    header('Location: frontend/html/abonne.html');
    exit;
}

$role = $user['role'];
$fullname = $user['fullname'];
$username = $user['username'];
$email = $user['email'];
$phone = $user['phone'] ?? '';
$gender = $user['gender'] ?? '';
$dateOfBirth = $user['date_of_birth'] ?? '';

// Stats for patient
$appointmentModel = new Appointment();
$appointments = $appointmentModel->getByUserId($userId);
$totalAppointments = count($appointments);
$pendingAppointments = 0;
$confirmedAppointments = 0;
$completedAppointments = 0;
foreach ($appointments as $a) {
    if ($a['status'] === 'pending') $pendingAppointments++;
    elseif ($a['status'] === 'confirmed') $confirmedAppointments++;
    elseif ($a['status'] === 'completed') $completedAppointments++;
}

// Stats for doctor/nurse/admin
$allAppointments = [];
$totalPatients = 0;
$todayAppointments = [];
if (in_array($role, ['doctor', 'nurse', 'admin'])) {
    $allAppointments = $appointmentModel->getAll();
    $totalPatients = 0;
    $patientIds = [];
    foreach ($allAppointments as $a) {
        if (!in_array($a['user_id'], $patientIds)) {
            $patientIds[] = $a['user_id'];
        }
    }
    $totalPatients = count($patientIds);
    $today = date('Y-m-d');
    foreach ($allAppointments as $a) {
        if ($a['appointment_date'] === $today) {
            $todayAppointments[] = $a;
        }
    }
}

// All users for admin
$allUsers = [];
if ($role === 'admin') {
    $allUsers = $userModel->getAllUsers();
}

function getInitials($name) {
    $parts = preg_split('/\s+/', trim($name));
    if (count($parts) >= 2) {
        return strtoupper($parts[0][0] . $parts[count($parts)-1][0]);
    }
    return strtoupper(substr($name, 0, 2));
}

function getRoleLabel($role) {
    $labels = ['patient' => 'Patient', 'doctor' => 'Médecin', 'nurse' => 'Infirmier(ère)', 'admin' => 'Administrateur'];
    return $labels[$role] ?? $role;
}

function getRoleBadgeClass($role) {
    return $role;
}

function getStatusBadge($status) {
    $labels = ['pending' => 'En attente', 'confirmed' => 'Confirmé', 'cancelled' => 'Annulé', 'completed' => 'Terminé'];
    return '<span class="status-badge ' . $status . '">' . ($labels[$status] ?? $status) . '</span>';
}

$initials = getInitials($fullname);
$roleLabel = getRoleLabel($role);
$today = date('Y-m-d');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tableau de bord - CongoVital</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="frontend/css/common.css">
    <link rel="stylesheet" href="frontend/css/dashboard.css">
</head>
<body>
<div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="dashboard-sidebar" id="sidebar">
        <div class="sidebar-header">
            <img src="photos/logo.jpg" alt="CongoVital">
            <h2>CongoVital</h2>
        </div>
        <div class="user-profile-sidebar">
            <div class="user-avatar-large"><?= $initials ?></div>
            <h3><?= htmlspecialchars($fullname) ?></h3>
            <span class="user-role-badge <?= getRoleBadgeClass($role) ?>"><?= $roleLabel ?></span>
        </div>
        <nav class="sidebar-nav" id="sidebar-nav">
            <?php if ($role === 'patient'): ?>
            <a class="nav-item active" data-section="overview"><span class="nav-icon">&#9632;</span> Tableau de bord</a>
            <a class="nav-item" data-section="appointments"><span class="nav-icon">&#9776;</span> Mes rendez-vous</a>
            <a class="nav-item" data-section="book"><span class="nav-icon">+</span> Prendre rendez-vous</a>
            <a class="nav-item" data-section="profile"><span class="nav-icon">&#9679;</span> Mon profil</a>
            <a class="nav-item" data-section="messages"><span class="nav-icon">&#9993;</span> Messages</a>
            <?php elseif ($role === 'doctor'): ?>
            <a class="nav-item active" data-section="overview"><span class="nav-icon">&#9632;</span> Tableau de bord</a>
            <a class="nav-item" data-section="appointments"><span class="nav-icon">&#9776;</span> Rendez-vous</a>
            <a class="nav-item" data-section="patients"><span class="nav-icon">&#9679;</span> Patients</a>
            <a class="nav-item" data-section="profile"><span class="nav-icon">&#9679;</span> Mon profil</a>
            <?php elseif ($role === 'nurse'): ?>
            <a class="nav-item active" data-section="overview"><span class="nav-icon">&#9632;</span> Tableau de bord</a>
            <a class="nav-item" data-section="appointments"><span class="nav-icon">&#9776;</span> Rendez-vous</a>
            <a class="nav-item" data-section="profile"><span class="nav-icon">&#9679;</span> Mon profil</a>
            <?php elseif ($role === 'admin'): ?>
            <a class="nav-item active" data-section="overview"><span class="nav-icon">&#9632;</span> Tableau de bord</a>
            <a class="nav-item" data-section="users"><span class="nav-icon">&#9679;</span> Utilisateurs</a>
            <a class="nav-item" data-section="appointments"><span class="nav-icon">&#9776;</span> Rendez-vous</a>
            <a class="nav-item" data-section="profile"><span class="nav-icon">&#9679;</span> Mon profil</a>
            <?php endif; ?>
            <a class="nav-item logout" id="logout-btn"><span class="nav-icon">&#8617;</span> Déconnexion</a>
        </nav>
    </aside>

    <!-- Main Content -->
    <main class="dashboard-main">
        <div class="dashboard-topbar">
            <button class="sidebar-toggle" id="sidebarToggle">&#9776;</button>
            <h1 id="pageTitle">Tableau de bord</h1>
            <div class="topbar-right">
                <div class="topbar-user">
                    <span><?= htmlspecialchars($fullname) ?></span>
                    <div class="topbar-avatar"><?= $initials ?></div>
                </div>
            </div>
        </div>

        <div class="dashboard-content">
            <div id="alert-container-dashboard"></div>

            <!-- ==================== OVERVIEW ==================== -->
            <section id="section-overview" class="dashboard-section active">
                <?php if ($role === 'patient'): ?>
                <h2 class="section-title">Bienvenue, <?= htmlspecialchars($fullname) ?></h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon green">&#9776;</div>
                        <div class="stat-info">
                            <h3><?= $totalAppointments ?></h3>
                            <p>Total rendez-vous</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange">&#9888;</div>
                        <div class="stat-info">
                            <h3><?= $pendingAppointments ?></h3>
                            <p>En attente</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon blue">&#10003;</div>
                        <div class="stat-info">
                            <h3><?= $confirmedAppointments ?></h3>
                            <p>Confirmés</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon purple">&#9733;</div>
                        <div class="stat-info">
                            <h3><?= $completedAppointments ?></h3>
                            <p>Terminés</p>
                        </div>
                    </div>
                </div>
                <?php elseif ($role === 'doctor'): ?>
                <h2 class="section-title">Tableau de bord - Médecin</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon green">&#9776;</div>
                        <div class="stat-info">
                            <h3><?= count($allAppointments) ?></h3>
                            <p>Total rendez-vous</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon blue">&#9679;</div>
                        <div class="stat-info">
                            <h3><?= $totalPatients ?></h3>
                            <p>Patients</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange">&#9888;</div>
                        <div class="stat-info">
                            <h3><?= count($todayAppointments) ?></h3>
                            <p>Aujourd'hui</p>
                        </div>
                    </div>
                </div>
                <?php elseif ($role === 'nurse'): ?>
                <h2 class="section-title">Tableau de bord - Infirmier(ère)</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon green">&#9776;</div>
                        <div class="stat-info">
                            <h3><?= count($allAppointments) ?></h3>
                            <p>Total rendez-vous</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon blue">&#9679;</div>
                        <div class="stat-info">
                            <h3><?= $totalPatients ?></h3>
                            <p>Patients</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange">&#9888;</div>
                        <div class="stat-info">
                            <h3><?= count($todayAppointments) ?></h3>
                            <p>Aujourd'hui</p>
                        </div>
                    </div>
                </div>
                <?php elseif ($role === 'admin'): ?>
                <h2 class="section-title">Tableau de bord - Administrateur</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon green">&#9679;</div>
                        <div class="stat-info">
                            <h3><?= $userModel->getTotalCount() ?></h3>
                            <p>Utilisateurs</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon blue">&#9776;</div>
                        <div class="stat-info">
                            <h3><?= count($allAppointments) ?></h3>
                            <p>Rendez-vous</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orange">&#9888;</div>
                        <div class="stat-info">
                            <h3><?= $totalPatients ?></h3>
                            <p>Patients</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon purple">&#9733;</div>
                        <div class="stat-info">
                            <h3><?= count($todayAppointments) ?></h3>
                            <p>Aujourd'hui</p>
                        </div>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Recent appointments widget -->
                <div class="card">
                    <div class="card-header">
                        <h3>Rendez-vous récents</h3>
                        <?php if ($role === 'patient'): ?>
                        <a class="btn-sm btn-outline" onclick="showSection('appointments')">Voir tout</a>
                        <?php endif; ?>
                    </div>
                    <?php $recentApps = array_slice($appointments, 0, 5); ?>
                    <?php if (count($recentApps) > 0): ?>
                    <div class="recent-appointments">
                        <?php foreach ($recentApps as $app): ?>
                        <div class="appointment-row">
                            <div class="app-info">
                                <h4><?= htmlspecialchars($app['service_type']) ?></h4>
                                <p><?= date('d/m/Y', strtotime($app['appointment_date'])) ?> à <?= substr($app['appointment_time'], 0, 5) ?></p>
                            </div>
                            <?= getStatusBadge($app['status']) ?>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <?php else: ?>
                    <div class="empty-state">
                        <div class="empty-icon">&#9776;</div>
                        <h3>Aucun rendez-vous</h3>
                        <p>Vous n'avez pas encore de rendez-vous.</p>
                        <?php if ($role === 'patient'): ?>
                        <br><a class="btn-sm btn-primary" onclick="showSection('book')">Prendre rendez-vous</a>
                        <?php endif; ?>
                    </div>
                    <?php endif; ?>
                </div>
            </section>

            <!-- ==================== APPOINTMENTS LIST ==================== -->
            <section id="section-appointments" class="dashboard-section">
                <h2 class="section-title"><?= $role === 'patient' ? 'Mes rendez-vous' : 'Liste des rendez-vous' ?></h2>
                <div class="card">
                    <div class="table-container">
                        <table class="dashboard-table">
                            <thead>
                                <tr>
                                    <?php if ($role !== 'patient'): ?><th>Patient</th><?php endif; ?>
                                    <th>Service</th>
                                    <th>Date</th>
                                    <th>Heure</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="appointments-table-body">
                                <?php
                                $displayApps = $role === 'patient' ? $appointments : $allAppointments;
                                if (count($displayApps) > 0):
                                    foreach ($displayApps as $app):
                                ?>
                                <tr>
                                    <?php if ($role !== 'patient'): ?>
                                    <td><?= htmlspecialchars($app['fullname'] ?? $app['username'] ?? 'N/A') ?></td>
                                    <?php endif; ?>
                                    <td><?= htmlspecialchars($app['service_type']) ?></td>
                                    <td><?= date('d/m/Y', strtotime($app['appointment_date'])) ?></td>
                                    <td><?= substr($app['appointment_time'], 0, 5) ?></td>
                                    <td><?= getStatusBadge($app['status']) ?></td>
                                    <td>
                                        <?php if ($app['status'] === 'pending'): ?>
                                        <button class="btn-sm btn-success" onclick="confirmAppointment(<?= $app['id'] ?>)">Confirmer</button>
                                        <button class="btn-sm btn-danger" onclick="cancelAppointment(<?= $app['id'] ?>)">Annuler</button>
                                        <?php elseif ($app['status'] === 'confirmed'): ?>
                                        <?php if (in_array($role, ['doctor', 'nurse', 'admin'])): ?>
                                        <button class="btn-sm btn-info" onclick="completeAppointment(<?= $app['id'] ?>)">Terminer</button>
                                        <?php endif; ?>
                                        <button class="btn-sm btn-danger" onclick="cancelAppointment(<?= $app['id'] ?>)">Annuler</button>
                                        <?php else: ?>
                                        <span style="color:#999;font-size:0.85em;">--</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                <?php
                                    endforeach;
                                else:
                                ?>
                                <tr><td colspan="<?= $role === 'patient' ? '5' : '6' ?>" style="text-align:center;padding:30px;color:#999;">Aucun rendez-vous trouvé</td></tr>
                                <?php endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- ==================== BOOK APPOINTMENT (patient only) ==================== -->
            <?php if ($role === 'patient'): ?>
            <section id="section-book" class="dashboard-section">
                <h2 class="section-title">Prendre un rendez-vous</h2>
                <div class="card form-card">
                    <div id="book-alert"></div>
                    <form id="book-appointment-form">
                        <div class="form-group">
                            <label for="book-service">Service *</label>
                            <select id="book-service" name="service_type" required>
                                <option value="">-- Sélectionnez un service --</option>
                                <option value="Consultation générale">Consultation générale</option>
                                <option value="Consultation pédiatrique">Consultation pédiatrique</option>
                                <option value="Consultation gynécologique">Consultation gynécologique</option>
                                <option value="Vaccination">Vaccination</option>
                                <option value="Soins infirmiers">Soins infirmiers</option>
                                <option value="Analyse médicale">Analyse médicale</option>
                                <option value="Suivi médical">Suivi médical</option>
                                <option value="Urgence">Urgence</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="book-date">Date *</label>
                            <input type="date" id="book-date" name="appointment_date" required min="<?= date('Y-m-d') ?>">
                        </div>
                        <div class="form-group">
                            <label for="book-time">Heure *</label>
                            <input type="time" id="book-time" name="appointment_time" required>
                        </div>
                        <div class="form-group">
                            <label for="book-notes">Notes (optionnel)</label>
                            <textarea id="book-notes" name="notes" placeholder="Informations complémentaires..." rows="3"></textarea>
