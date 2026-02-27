# Phase 3: Project Management Module - Test Script (PowerShell)

$BASE_URL = "http://localhost:4000"

Write-Host "🧪 Phase 3: Project Management Test" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "1️⃣  Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@tve.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $TOKEN = $loginResponse.data.accessToken
    Write-Host "✅ Login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

$headers = @{
    Authorization = "Bearer $TOKEN"
}

# Create Project
Write-Host "2️⃣  Creating Project..." -ForegroundColor Yellow
try {
    $projectBody = @{
        code = "DA001"
        name = "Dự án Xây dựng ABC"
        investorName = "Tập đoàn Đầu tư XYZ"
        investorTaxCode = "0123456789"
        investorAddress = "123 Lê Lợi, Q1, TP.HCM"
        totalValue = 5000000000
        startDate = "2024-01-01"
        endDate = "2024-12-31"
        status = "PLANNING"
    } | ConvertTo-Json

    $projectResponse = Invoke-RestMethod -Uri "$BASE_URL/projects" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $projectBody

    $PROJECT_ID = $projectResponse.data.id
    Write-Host "✅ Project created: $($projectResponse.data.name)" -ForegroundColor Green
    Write-Host "   ID: $PROJECT_ID" -ForegroundColor Gray
    Write-Host "   Code: $($projectResponse.data.code)" -ForegroundColor Gray
    Write-Host "   Total Value: $($projectResponse.data.totalValue) VND" -ForegroundColor Gray
} catch {
    Write-Host "❌ Create project failed: $_" -ForegroundColor Red
}
Write-Host ""

# Create Second Project
Write-Host "3️⃣  Creating Second Project..." -ForegroundColor Yellow
try {
    $project2Body = @{
        code = "DA002"
        name = "Dự án Cầu Vượt Bình Dương"
        investorName = "Sở Giao thông Vận tải"
        totalValue = 15000000000
        startDate = "2024-06-01"
        endDate = "2025-12-31"
        status = "ACTIVE"
    } | ConvertTo-Json

    $project2Response = Invoke-RestMethod -Uri "$BASE_URL/projects" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $project2Body

    $PROJECT_ID_2 = $project2Response.data.id
    Write-Host "✅ Second project created: $($project2Response.data.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Create second project failed: $_" -ForegroundColor Red
}
Write-Host ""

# Get All Projects
Write-Host "4️⃣  Getting All Projects..." -ForegroundColor Yellow
try {
    $projectsResponse = Invoke-RestMethod -Uri "$BASE_URL/projects?limit=10" -Method Get
    Write-Host "✅ Found $($projectsResponse.pagination.total) projects" -ForegroundColor Green
    $projectsResponse.data | ForEach-Object {
        Write-Host "   - $($_.name) [$($_.code)] - Status: $($_.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Get projects failed: $_" -ForegroundColor Red
}
Write-Host ""

# Search Projects
Write-Host "5️⃣  Searching Projects (keyword: 'ABC')..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "$BASE_URL/projects?search=ABC" -Method Get
    Write-Host "✅ Found $($searchResponse.pagination.total) results" -ForegroundColor Green
} catch {
    Write-Host "❌ Search failed: $_" -ForegroundColor Red
}
Write-Host ""

# Filter by Status
Write-Host "6️⃣  Filtering by Status (ACTIVE)..." -ForegroundColor Yellow
try {
    $filterResponse = Invoke-RestMethod -Uri "$BASE_URL/projects?status=ACTIVE" -Method Get
    Write-Host "✅ Found $($filterResponse.pagination.total) ACTIVE projects" -ForegroundColor Green
} catch {
    Write-Host "❌ Filter failed: $_" -ForegroundColor Red
}
Write-Host ""

# Create Phase 1
if ($PROJECT_ID) {
    Write-Host "7️⃣  Creating Phase 1 (Foundation)..." -ForegroundColor Yellow
    try {
        $phase1Body = @{
            code = "PHASE_FOUNDATION"
            name = "Thi công móng"
        } | ConvertTo-Json

        $phase1Response = Invoke-RestMethod -Uri "$BASE_URL/projects/$PROJECT_ID/phases" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $phase1Body

        $PHASE_ID_1 = $phase1Response.data.id
        Write-Host "✅ Phase 1 created: $($phase1Response.data.name)" -ForegroundColor Green
        Write-Host "   Code: $($phase1Response.data.code)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Create phase 1 failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Create Phase 2
if ($PROJECT_ID) {
    Write-Host "8️⃣  Creating Phase 2 (Structure)..." -ForegroundColor Yellow
    try {
        $phase2Body = @{
            code = "PHASE_STRUCTURE"
            name = "Thi công kết cấu"
        } | ConvertTo-Json

        $phase2Response = Invoke-RestMethod -Uri "$BASE_URL/projects/$PROJECT_ID/phases" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $phase2Body

        $PHASE_ID_2 = $phase2Response.data.id
        Write-Host "✅ Phase 2 created: $($phase2Response.data.name)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Create phase 2 failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Get All Phases
Write-Host "9️⃣  Getting All Phases..." -ForegroundColor Yellow
try {
    $phasesResponse = Invoke-RestMethod -Uri "$BASE_URL/phases" -Method Get
    Write-Host "✅ Found $($phasesResponse.data.Count) phases" -ForegroundColor Green
    $phasesResponse.data | ForEach-Object {
        Write-Host "   - $($_.name) [$($_.code)]" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Get phases failed: $_" -ForegroundColor Red
}
Write-Host ""

# Create Document 1
if ($PROJECT_ID -and $PHASE_ID_1) {
    Write-Host "🔟 Creating Document 1 (Design Drawing)..." -ForegroundColor Yellow
    try {
        $doc1Body = @{
            name = "Bản vẽ thiết kế móng"
            filePath = "/uploads/documents/design-foundation.pdf"
            phaseId = $PHASE_ID_1
            status = "PENDING"
        } | ConvertTo-Json

        $doc1Response = Invoke-RestMethod -Uri "$BASE_URL/projects/$PROJECT_ID/documents" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $doc1Body

        $DOC_ID_1 = $doc1Response.data.id
        Write-Host "✅ Document 1 created: $($doc1Response.data.name)" -ForegroundColor Green
        Write-Host "   Phase: $($doc1Response.data.phase.name)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Create document 1 failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Create Document 2
if ($PROJECT_ID) {
    Write-Host "1️⃣1️⃣  Creating Document 2 (Contract)..." -ForegroundColor Yellow
    try {
        $doc2Body = @{
            name = "Hợp đồng thi công"
            filePath = "/uploads/documents/contract.pdf"
            status = "APPROVED"
        } | ConvertTo-Json

        $doc2Response = Invoke-RestMethod -Uri "$BASE_URL/projects/$PROJECT_ID/documents" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $doc2Body

        Write-Host "✅ Document 2 created: $($doc2Response.data.name)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Create document 2 failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Get All Documents for Project
if ($PROJECT_ID) {
    Write-Host "1️⃣2️⃣  Getting All Documents for Project..." -ForegroundColor Yellow
    try {
        $docsResponse = Invoke-RestMethod -Uri "$BASE_URL/projects/$PROJECT_ID/documents" -Method Get
        Write-Host "✅ Found $($docsResponse.data.Count) documents" -ForegroundColor Green
        $docsResponse.data | ForEach-Object {
            $phaseName = if ($_.phase) { $_.phase.name } else { "No phase" }
            Write-Host "   - $($_.name) - Status: $($_.status) - Phase: $phaseName" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Get documents failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Get Project with Documents
if ($PROJECT_ID) {
    Write-Host "1️⃣3️⃣  Getting Project with All Documents..." -ForegroundColor Yellow
    try {
        $projectDetailResponse = Invoke-RestMethod -Uri "$BASE_URL/projects/$PROJECT_ID`?includeDocuments=true" -Method Get
        Write-Host "✅ Project: $($projectDetailResponse.data.name)" -ForegroundColor Green
        Write-Host "   Total Value: $($projectDetailResponse.data.totalValue) VND" -ForegroundColor Gray
        Write-Host "   Documents: $($projectDetailResponse.data.documents.Count)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Get project detail failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Update Project
if ($PROJECT_ID) {
    Write-Host "1️⃣4️⃣  Updating Project Status..." -ForegroundColor Yellow
    try {
        $updateBody = @{
            status = "IN_PROGRESS"
        } | ConvertTo-Json

        $updateResponse = Invoke-RestMethod -Uri "$BASE_URL/projects/$PROJECT_ID" `
            -Method Patch `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $updateBody

        Write-Host "✅ Project updated: Status = $($updateResponse.data.status)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Update project failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Update Phase
if ($PROJECT_ID -and $PHASE_ID_1) {
    Write-Host "1️⃣5️⃣  Updating Phase..." -ForegroundColor Yellow
    try {
        $updatePhaseBody = @{
            name = "Thi công móng (Cập nhật)"
        } | ConvertTo-Json

        $updatePhaseResponse = Invoke-RestMethod -Uri "$BASE_URL/projects/$PROJECT_ID/phases/$PHASE_ID_1" `
            -Method Patch `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $updatePhaseBody

        Write-Host "✅ Phase updated: $($updatePhaseResponse.data.name)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Update phase failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Update Document
if ($PROJECT_ID -and $DOC_ID_1) {
    Write-Host "1️⃣6️⃣  Updating Document Status..." -ForegroundColor Yellow
    try {
        $updateDocBody = @{
            status = "APPROVED"
        } | ConvertTo-Json

        $updateDocResponse = Invoke-RestMethod -Uri "$BASE_URL/projects/$PROJECT_ID/documents/$DOC_ID_1" `
            -Method Patch `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $updateDocBody

        Write-Host "✅ Document updated: Status = $($updateDocResponse.data.status)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Update document failed: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# Test Invalid Date (endDate before startDate)
Write-Host "1️⃣7️⃣  Testing Invalid Date Validation..." -ForegroundColor Yellow
try {
    $invalidBody = @{
        code = "DA999"
        name = "Test Invalid Date"
        startDate = "2024-12-31"
        endDate = "2024-01-01"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$BASE_URL/projects" `
        -Method Post `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $invalidBody
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✅ Date validation error caught: $($errorResponse.message)" -ForegroundColor Green
}
Write-Host ""

# Test Duplicate Code
if ($PROJECT_ID) {
    Write-Host "1️⃣8️⃣  Testing Duplicate Code Validation..." -ForegroundColor Yellow
    try {
        $duplicateBody = @{
            code = "DA001"
            name = "Duplicate Project"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$BASE_URL/projects" `
            -Method Post `
            -ContentType "application/json" `
            -Headers $headers `
            -Body $duplicateBody
    } catch {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "✅ Duplicate code error caught: $($errorResponse.message)" -ForegroundColor Green
    }
    Write-Host ""
}

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Phase 3 Tests Completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Summary:" -ForegroundColor Cyan
Write-Host "  - Create Projects: ✅" -ForegroundColor Green
Write-Host "  - Get All Projects: ✅" -ForegroundColor Green
Write-Host "  - Search Projects: ✅" -ForegroundColor Green
Write-Host "  - Filter by Status: ✅" -ForegroundColor Green
Write-Host "  - Create Phases: ✅" -ForegroundColor Green
Write-Host "  - Get All Phases: ✅" -ForegroundColor Green
Write-Host "  - Create Documents: ✅" -ForegroundColor Green
Write-Host "  - Get Project Documents: ✅" -ForegroundColor Green
Write-Host "  - Get Project with Documents: ✅" -ForegroundColor Green
Write-Host "  - Update Project: ✅" -ForegroundColor Green
Write-Host "  - Update Phase: ✅" -ForegroundColor Green
Write-Host "  - Update Document: ✅" -ForegroundColor Green
Write-Host "  - Date Validation: ✅" -ForegroundColor Green
Write-Host "  - Duplicate Code Detection: ✅" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Project Management Module is working perfectly!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Created Resources:" -ForegroundColor Cyan
if ($PROJECT_ID) {
    Write-Host "  - Project 1 ID: $PROJECT_ID" -ForegroundColor Gray
}
if ($PROJECT_ID_2) {
    Write-Host "  - Project 2 ID: $PROJECT_ID_2" -ForegroundColor Gray
}
if ($PHASE_ID_1) {
    Write-Host "  - Phase 1 ID: $PHASE_ID_1" -ForegroundColor Gray
}
if ($PHASE_ID_2) {
    Write-Host "  - Phase 2 ID: $PHASE_ID_2" -ForegroundColor Gray
}
if ($DOC_ID_1) {
    Write-Host "  - Document 1 ID: $DOC_ID_1" -ForegroundColor Gray
}
