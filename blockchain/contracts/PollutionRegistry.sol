// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title PollutionRegistry
 * @dev Smart contract for storing pollution report hashes on-chain
 * @notice This contract provides an immutable audit trail for water pollution reports
 */
contract PollutionRegistry {
    
    // ========================================================================
    // STATE VARIABLES
    // ========================================================================
    
    address public owner;
    uint256 public reportCount;
    
    struct Report {
        bytes32 reportHash;      // SHA-256 hash of report data
        uint256 timestamp;       // Block timestamp
        address submitter;       // Address that submitted the hash
        bool verified;           // Verification status
        string reportId;         // UUID of the report
        string aiDecision;       // Classification from AI
        string reviewerDecision; // Final status/decision
        bytes32 locationHash;    // Hashed coordinates for privacy
    }
    
    // Mapping from report ID to Report struct
    mapping(uint256 => Report) public reports;
    
    // Mapping from report hash to report ID (prevent duplicates)
    mapping(bytes32 => uint256) public hashToReportId;
    
    // ========================================================================
    // EVENTS
    // ========================================================================
    
    event ReportLogged(
        uint256 indexed id,
        bytes32 indexed reportHash,
        string reportId,
        address indexed submitter,
        uint256 timestamp
    );
    
    event ReportVerified(
        uint256 indexed id,
        address indexed verifier,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    
    // ========================================================================
    // MODIFIERS
    // ========================================================================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier reportExists(uint256 _id) {
        require(_id > 0 && _id <= reportCount, "Report does not exist");
        _;
    }
    
    // ========================================================================
    // CONSTRUCTOR
    // ========================================================================
    
    constructor() {
        owner = msg.sender;
        reportCount = 0;
    }
    
    // ========================================================================
    // PUBLIC FUNCTIONS
    // ========================================================================
    
    /**
     * @dev Log a new pollution report with metadata
     * @param _reportHash SHA-256 hash of the full report data
     * @param _reportId UUID string of the report
     * @param _aiDecision The result of the AI classification
     * @param _reviewerDecision The initial status (e.g., pending/verified)
     * @param _locationHash Hashed coordinates
     * @return id The numerical ID of the newly logged report
     */
    function logReport(
        bytes32 _reportHash,
        string memory _reportId,
        string memory _aiDecision,
        string memory _reviewerDecision,
        bytes32 _locationHash
    ) public onlyOwner returns (uint256) {
        require(_reportHash != bytes32(0), "Invalid report hash");
        require(hashToReportId[_reportHash] == 0, "Report hash already exists");
        
        reportCount++;
        uint256 newId = reportCount;
        
        reports[newId] = Report({
            reportHash: _reportHash,
            timestamp: block.timestamp,
            submitter: msg.sender,
            verified: false,
            reportId: _reportId,
            aiDecision: _aiDecision,
            reviewerDecision: _reviewerDecision,
            locationHash: _locationHash
        });
        
        hashToReportId[_reportHash] = newId;
        
        emit ReportLogged(newId, _reportHash, _reportId, msg.sender, block.timestamp);
        
        return newId;
    }
    
    /**
     * @dev Verify a pollution report (admin/NGO action)
     * @param _id The ID of the report to verify
     */
    function verifyReport(uint256 _id) public onlyOwner reportExists(_id) {
        require(!reports[_id].verified, "Report already verified");
        
        reports[_id].verified = true;
        reports[_id].reviewerDecision = "verified";
        
        emit ReportVerified(_id, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get report details by ID
     * @param _id The ID of the report
     */
    function getReport(uint256 _id) 
        public 
        view 
        reportExists(_id) 
        returns (
            bytes32 reportHash,
            uint256 timestamp,
            address submitter,
            bool verified,
            string memory reportId,
            string memory aiDecision,
            string memory reviewerDecision,
            bytes32 locationHash
        ) 
    {
        Report memory report = reports[_id];
        return (
            report.reportHash,
            report.timestamp,
            report.submitter,
            report.verified,
            report.reportId,
            report.aiDecision,
            report.reviewerDecision,
            report.locationHash
        );
    }
    
    /**
     * @dev Check if a report hash exists
     * @param _reportHash The hash to check
     * @return exists Whether the hash exists
     * @return reportId The ID of the report (0 if not exists)
     */
    function reportHashExists(bytes32 _reportHash) 
        public 
        view 
        returns (bool exists, uint256 reportId) 
    {
        reportId = hashToReportId[_reportHash];
        exists = reportId != 0;
        return (exists, reportId);
    }
    
    /**
     * @dev Get total number of reports
     * @return Total reports logged
     */
    function getTotalReports() public view returns (uint256) {
        return reportCount;
    }
    
    /**
     * @dev Transfer ownership
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
}
